require('dotenv').config();
const { pool } = require('./index');
async function run() {
  const client = await pool.connect();
  // Check what ID pattern barangay users have
  const { rows: users } = await client.query(
    `SELECT id, office_name FROM users WHERE role = 'barangay' LIMIT 5`
  );
  console.log('Sample barangay user IDs:');
  users.forEach(u => console.log(` user.id="${u.id}"  office_name="${u.office_name}"`));

  // Check the barangay table ID pattern
  const { rows: brgys } = await client.query(
    `SELECT id, name FROM barangays WHERE name IN ('Barangay 676', 'Barangay 651', 'Barangay 649') ORDER BY name`
  );
  console.log('\nBarangay table rows:');
  brgys.forEach(b => console.log(` barangay.id="${b.id}"  name="${b.name}"`));

  // Check how getBarangayById is called — it uses the user.id
  // So if user.id = 'brgy-barangay-676', does that match the barangays table?
  const { rows: match } = await client.query(
    `SELECT id, name, lat, lng FROM barangays WHERE id = 'brgy-barangay-676'`
  );
  console.log('\nLookup by id="brgy-barangay-676":', match.length ? match[0] : 'NOT FOUND');

  const { rows: match2 } = await client.query(
    `SELECT id, name, lat, lng FROM barangays WHERE id = 'b-barangay-676'`
  );
  console.log('Lookup by id="b-barangay-676":', match2.length ? match2[0] : 'NOT FOUND');

  client.release();
  pool.end();
}
run();
