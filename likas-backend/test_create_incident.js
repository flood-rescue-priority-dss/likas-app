const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testCreateIncident() {
  try {
    // Get a valid barangay ID
    const { rows: barangays } = await pool.query('SELECT id, name FROM barangays LIMIT 1');
    
    if (barangays.length === 0) {
      console.log('❌ No barangays found in database');
      await pool.end();
      return;
    }
    
    const testBarangay = barangays[0];
    console.log(`\n✓ Using test barangay: ${testBarangay.name} (${testBarangay.id})\n`);
    
    // Test insert
    const testId = `fi-test-${Date.now()}`;
    await pool.query(
      `INSERT INTO flood_incidents 
       (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority, logged_by_role, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [testId, testBarangay.id, '2026-07-10', '14:30', 'Test Street', 15.5, 'PATV', 'Heavy Rainfall', 'Medium', 'barangay', 'Pending']
    );
    
    console.log('✅ Successfully inserted test incident!');
    console.log(`   ID: ${testId}`);
    
    // Verify it was inserted with correct approval_status
    const { rows } = await pool.query(
      'SELECT id, approval_status, logged_by_role FROM flood_incidents WHERE id = $1',
      [testId]
    );
    
    console.log(`✓ Verified: approval_status = ${rows[0].approval_status}`);
    console.log(`✓ Verified: logged_by_role = ${rows[0].logged_by_role}`);
    
    // Clean up
    await pool.query('DELETE FROM flood_incidents WHERE id = $1', [testId]);
    console.log('\n✓ Test cleanup complete\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testCreateIncident();
