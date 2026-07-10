const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
  try {
    // Check if brgy-676 exists as a barangay
    const { rows: existing } = await pool.query("SELECT id FROM barangays WHERE id='brgy-676'");
    
    if (existing.length > 0) {
      console.log('✓ brgy-676 already exists in barangays table');
      await pool.end();
      return;
    }
    
    // Get a sample city to add the barangay to
    const { rows: cities } = await pool.query('SELECT id, name FROM cities LIMIT 1');
    if (cities.length === 0) {
      console.log('❌ No cities found');
      await pool.end();
      return;
    }
    
    const city = cities[0];
    console.log(`Adding brgy-676 to city: ${city.name}`);
    
    // Insert brgy-676 into barangays table
    await pool.query(
      `INSERT INTO barangays (id, city_id, name, population, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['brgy-676', city.id, 'Barangay 676', 5000, 14.5995, 120.9842]
    );
    
    console.log('✅ Successfully added brgy-676 to barangays table');
    
    // Verify
    const { rows: verify } = await pool.query("SELECT id, name FROM barangays WHERE id='brgy-676'");
    console.log(`✓ Verified: ${verify[0].name} (${verify[0].id})`);
    
    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    await pool.end();
    process.exit(1);
  }
}

fix();
