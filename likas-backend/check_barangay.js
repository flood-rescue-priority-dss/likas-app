const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const { rows } = await pool.query("SELECT id, name FROM barangays WHERE id = 'brgy-676'");
    console.log('brgy-676 exists:', rows.length > 0 ? `Yes - ${rows[0].name}` : 'NO');
    
    // Show valid barangay IDs pattern
    const { rows: sample } = await pool.query('SELECT id FROM barangays ORDER BY id LIMIT 5');
    console.log('Valid IDs:', sample.map(r => r.id).join(', '));
    
    await pool.end();
  } catch (e) {
    console.error(e.message);
    await pool.end();
  }
}

check();
