require('dotenv').config();
const { pool } = require('./index');

// Simulate the same slug→name heuristic from geography.js
function deriveNameFromSlug(slug) {
  const numMatch = slug.match(/(\d+(?:-[a-z])?)\s*$/i);
  if (numMatch) return `Barangay ${numMatch[1].toUpperCase()}`;
  return null;
}

async function testLookup(id) {
  const client = await pool.connect();
  try {
    // Direct lookup
    const { rows } = await client.query(
      `SELECT b.id, b.name, b.lat, b.lng FROM barangays b WHERE b.id = $1`,
      [id]
    );
    if (rows.length > 0) {
      console.log(`✅ Direct hit  id="${id}" → name="${rows[0].name}" lat=${rows[0].lat}`);
      return;
    }

    // Fallback
    const derived = deriveNameFromSlug(id);
    if (!derived) { console.log(`❌ No fallback possible for id="${id}"`); return; }

    const { rows: byName } = await client.query(
      `SELECT b.id, b.name, b.lat, b.lng FROM barangays b WHERE LOWER(b.name) = LOWER($1)`,
      [derived]
    );
    if (byName.length > 0) {
      console.log(`✅ Fallback hit id="${id}" → derived="${derived}" → name="${byName[0].name}" lat=${byName[0].lat}`);
    } else {
      console.log(`❌ Miss         id="${id}" → derived="${derived}" → NOT FOUND`);
    }
  } finally {
    client.release();
  }
}

async function main() {
  // Test all the user id patterns found in the DB
  const testIds = [
    'u-brgy-676',       // the broken case from the screenshot
    'brgy-777',         // another real user id pattern
    'brgy-255',
    'brgy-670',
    'b-barangay-676',   // the actual barangays.id — direct lookup should work
    'bgy-barangay-651', // the reconcile script pattern
    'brgy-659-a',       // hyphenated suffix
  ];

  for (const id of testIds) {
    await testLookup(id);
  }
  pool.end();
}
main();
