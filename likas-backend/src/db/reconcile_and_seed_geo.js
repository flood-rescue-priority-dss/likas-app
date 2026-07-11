require('dotenv').config();
const { pool } = require('./index');
const { BARANGAY_RECORDS } = require('../../data/geo_source_by_name');

// Safe by default: this script only PRINTS a plan unless you pass --apply.
//   node reconcile_and_seed_geo.js            -> dry run, prints the plan, changes nothing
//   node reconcile_and_seed_geo.js --apply    -> actually writes to the DB
const APPLY = process.argv.includes('--apply');

function slugifyBarangayId(name) {
  // Matches the pattern already observed in the live DB (checked against
  // barangays_rows.csv export): "Barangay 1" -> "b-barangay-1"
  return 'b-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows: dbDistricts } = await client.query('SELECT id, name FROM districts');
    const { rows: dbCities }    = await client.query('SELECT id, name, district_id FROM cities');
    const { rows: dbBarangays } = await client.query('SELECT id, name, city_id FROM barangays');

    const districtIdByName = new Map(dbDistricts.map(d => [d.name, d.id]));
    const cityIdByName     = new Map(dbCities.map(c => [c.name, c.id]));
    // DB stores names as "BARANGAY 178" (uppercase) while our source data uses
    // "Barangay 178" (title case) -- match case-insensitively so existing rows
    // are correctly recognized instead of being treated as new inserts.
    const barangayIdByName = new Map(dbBarangays.map(b => [b.name.trim().toUpperCase(), b.id]));

    const plan = {
      matchedBarangays: [],      // already exist -> just fill in district_id
      newBarangays: [],          // don't exist yet -> need INSERT
      blockedMissingDistrict: [],// districtName has no match in DB districts table
      blockedMissingCity: [],    // areaName has no match in DB cities table
    };

    for (const rec of BARANGAY_RECORDS) {
      const districtId = districtIdByName.get(rec.districtName);
      const cityId = cityIdByName.get(rec.areaName);

      if (!districtId) {
        plan.blockedMissingDistrict.push(rec);
        continue;
      }
      if (!cityId) {
        plan.blockedMissingCity.push(rec);
        continue;
      }

      const existingId = barangayIdByName.get(rec.barangayName.trim().toUpperCase());
      if (existingId) {
        plan.matchedBarangays.push({ id: existingId, districtId, cityId, ...rec });
      } else {
        plan.newBarangays.push({
          id: slugifyBarangayId(rec.barangayName),
          districtId,
          cityId,
          ...rec,
        });
      }
    }

    // ---- Report ----
    console.log('=== Reconciliation plan ===');
    console.log(`Already in DB, will set district_id only:  ${plan.matchedBarangays.length}`);
    console.log(`New barangays to INSERT:                   ${plan.newBarangays.length}`);
    console.log(`Blocked -- district name not found in DB:  ${plan.blockedMissingDistrict.length}`);
    console.log(`Blocked -- city/area name not found in DB: ${plan.blockedMissingCity.length}`);

    if (plan.blockedMissingDistrict.length) {
      const names = [...new Set(plan.blockedMissingDistrict.map(r => r.districtName))];
      console.log('\nDistrict names with no match in your districts table:');
      console.log(' ', names.join(', '));
      console.log('  -> These barangays are SKIPPED entirely until you resolve this manually.');
    }

    if (plan.blockedMissingCity.length) {
      const names = [...new Set(plan.blockedMissingCity.map(r => r.areaName))];
      console.log('\nArea names with no match in your cities table:');
      console.log(' ', names.join(', '));
      console.log('  -> These barangays are SKIPPED entirely. Since your city IDs don\'t follow');
      console.log('     a predictable slug (e.g. "Tondo I" -> "c-tondo", not "c-tondo-i"),');
      console.log('     create any missing city rows manually first, then re-run this script.');
    }

    if (plan.newBarangays.length) {
      console.log(`\nSample of new barangay IDs that WOULD be created (first 5):`);
      for (const b of plan.newBarangays.slice(0, 5)) {
        console.log(`  ${b.id}  (name="${b.barangayName}", city_id=${b.cityId}, district_id=${b.districtId})`);
      }
      console.log('  -> Review these carefully. If your team creates barangay IDs by hand');
      console.log('     rather than by this slug pattern, do NOT use --apply until confirmed.');
    }

    if (!APPLY) {
      console.log('\nDry run only -- no changes were made. Re-run with --apply to write these changes.');
      return;
    }

    // ---- Apply ----
    console.log('\nApplying changes...');
    await client.query('BEGIN');

    for (const b of plan.matchedBarangays) {
      await client.query(
        `UPDATE barangays SET district_id = $1 WHERE id = $2 AND district_id IS NULL`,
        [b.districtId, b.id]
      );
    }

    for (const b of plan.newBarangays) {
      await client.query(
        `INSERT INTO barangays (id, city_id, district_id, name, population, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [b.id, b.cityId, b.districtId, b.barangayName, 0, b.lat, b.lng]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Applied successfully.');
    console.log(`  ${plan.matchedBarangays.length} existing barangays had district_id filled in.`);
    console.log(`  ${plan.newBarangays.length} new barangays inserted (population=0, needs real data later).`);
  } catch (e) {
    if (APPLY) await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Failed:', e);
    throw e;
  } finally {
    client.release();
    pool.end();
  }
}

main();
