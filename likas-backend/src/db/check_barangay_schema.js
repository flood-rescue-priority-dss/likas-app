require('dotenv').config();
const { pool } = require('./index');
async function run() {
  const client = await pool.connect();
  const { rows } = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = 'barangays' ORDER BY ordinal_position`
  );
  console.log('barangays columns:');
  rows.forEach(c => console.log(' ', c.column_name, '-', c.data_type));
  client.release();
  pool.end();
}
run();
