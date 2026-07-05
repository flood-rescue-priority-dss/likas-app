require('dotenv').config();
const { pool } = require('./src/db/index');

async function check() {
  const b = await pool.query("SELECT id FROM barangays WHERE name ILIKE '%676%'");
  const brgyId = b.rows[0].id;
  const s = await pool.query('SELECT street_name FROM street_registry WHERE barangay_id = $1', [brgyId]);
  console.log('Streets in Registry:', s.rows.map(x => x.street_name));
  const f = await pool.query('SELECT DISTINCT street FROM flood_incidents WHERE barangay_id = $1', [brgyId]);
  console.log('Unique Streets in Flood Records:', f.rows.map(x => x.street));
  process.exit();
}
check();
