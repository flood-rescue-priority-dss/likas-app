require('dotenv').config();
const { pool } = require('./index');

async function fixBarangay676() {
  const client = await pool.connect();
  try {
    // Get District 5 ID
    const { rows: districts } = await client.query(
      "SELECT id FROM districts WHERE name = 'District 5'"
    );
    
    if (districts.length === 0) {
      throw new Error('District 5 not found');
    }
    
    const districtId = districts[0].id;
    
    // Update Barangay 676
    const result = await client.query(
      `UPDATE barangays SET district_id = $1 WHERE id = 'bgy-barangay-676'`,
      [districtId]
    );
    
    console.log(`✅ Fixed Barangay 676 - ${result.rowCount} row(s) updated`);
    
    // Verify
    const { rows: verify } = await client.query(
      "SELECT b.name, c.name as city, d.name as district FROM barangays b JOIN cities c ON b.city_id = c.id JOIN districts d ON b.district_id = d.id WHERE b.id = 'bgy-barangay-676'"
    );
    
    if (verify.length > 0) {
      console.log('Verified:', verify[0]);
    }
  } catch (err) {
    console.error('❌ Failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

fixBarangay676();
