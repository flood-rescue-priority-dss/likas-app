const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const { rows } = await pool.query("SELECT id, office_name, role, registered_email FROM users WHERE role='barangay' ORDER BY id LIMIT 10");
    console.log('\nBarangay user accounts:');
    rows.forEach(u => console.log(`  ${u.id.padEnd(25)} ${u.office_name.padEnd(30)} ${u.registered_email}`));
    
    // Check if brgy-676 exists
    const { rows: check } = await pool.query("SELECT id FROM users WHERE id='brgy-676'");
    console.log(`\nbrgy-676 user exists: ${check.length > 0 ? 'YES' : 'NO'}`);
    
    // Check if it exists as a barangay
    const { rows: bcheck } = await pool.query("SELECT id FROM barangays WHERE id='brgy-676'");
    console.log(`brgy-676 barangay exists: ${bcheck.length > 0 ? 'YES' : 'NO'}`);
    
    await pool.end();
  } catch (e) {
    console.error(e.message);
    await pool.end();
  }
}

check();
