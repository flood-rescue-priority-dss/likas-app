const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'src', 'db', 'migrate_add_approval_status.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'flood_incidents' 
      AND column_name = 'approval_status'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Column approval_status exists:');
      console.log('   Type:', result.rows[0].data_type);
      console.log('   Default:', result.rows[0].column_default);
      
      // Count records by status
      const counts = await client.query(`
        SELECT approval_status, COUNT(*) as count
        FROM flood_incidents
        GROUP BY approval_status
      `);
      console.log('\n📊 Current approval status distribution:');
      counts.rows.forEach(row => {
        console.log(`   ${row.approval_status}: ${row.count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
