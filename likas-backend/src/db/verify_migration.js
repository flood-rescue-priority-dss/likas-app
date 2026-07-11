require('dotenv').config();
const { pool } = require('./index');

async function verifyMigration() {
  const client = await pool.connect();
  try {
    // Check if district_id column exists and has data
    const { rows } = await client.query(`
      SELECT 
        COUNT(*) as total_barangays,
        COUNT(district_id) as barangays_with_district,
        COUNT(CASE WHEN district_id IS NULL THEN 1 END) as barangays_without_district
      FROM barangays
    `);
    
    console.log('=== Verification Results ===');
    console.log(`Total barangays:                 ${rows[0].total_barangays}`);
    console.log(`Barangays with district_id:      ${rows[0].barangays_with_district}`);
    console.log(`Barangays without district_id:   ${rows[0].barangays_without_district}`);
    
    // Sample some barangays with district_id
    const { rows: samples } = await client.query(`
      SELECT b.name as barangay_name, c.name as city_name, d.name as district_name
      FROM barangays b
      JOIN cities c ON b.city_id = c.id
      JOIN districts d ON b.district_id = d.id
      LIMIT 5
    `);
    
    console.log('\nSample barangays with district_id:');
    samples.forEach(s => {
      console.log(`  ${s.barangay_name} (${s.city_name}, ${s.district_name})`);
    });
    
    // Check for any edge cases (Paco split across districts)
    const { rows: pacoBarangays } = await client.query(`
      SELECT b.name as barangay_name, c.name as city_name, d.name as district_name
      FROM barangays b
      JOIN cities c ON b.city_id = c.id
      JOIN districts d ON b.district_id = d.id
      WHERE c.name = 'Paco'
      ORDER BY d.name, b.name
    `);
    
    if (pacoBarangays.length > 0) {
      console.log('\nPaco barangays (should span District 5 and District 6):');
      const dist5 = pacoBarangays.filter(p => p.district_name === 'District 5').length;
      const dist6 = pacoBarangays.filter(p => p.district_name === 'District 6').length;
      console.log(`  District 5: ${dist5} barangays`);
      console.log(`  District 6: ${dist6} barangays`);
      if (dist5 > 0 && dist6 > 0) {
        console.log('  ✅ Paco correctly split across districts!');
      }
    }
    
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

verifyMigration();
