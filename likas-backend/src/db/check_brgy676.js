require('dotenv').config();
const { pool } = require('./index');
async function run() {
  const client = await pool.connect();
  const { rows } = await client.query(
    `SELECT id, name, lat, lng FROM barangays WHERE id = 'bgy-barangay-676' OR name = 'Barangay 676'`
  );
  console.log('Barangay 676 DB row:', rows);
  client.release();
  pool.end();
}
run();
