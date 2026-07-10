const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'flood_incidents' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 flood_incidents table columns:\n');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} Default: ${col.column_default || 'NULL'}`)  ;
    });
    
    // Check if logged_by_role exists
    const hasLoggedByRole = result.rows.some(r => r.column_name === 'logged_by_role');
    console.log(`\n✓ logged_by_role exists: ${hasLoggedByRole}`);
    
    const hasApprovalStatus = result.rows.some(r => r.column_name === 'approval_status');
    console.log(`✓ approval_status exists: ${hasApprovalStatus}`);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkColumns();
