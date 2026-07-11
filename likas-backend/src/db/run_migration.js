require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigration(sqlFilePath) {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`Running migration: ${sqlFilePath}`);
    console.log('---');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node run_migration.js <path-to-sql-file>');
  process.exit(1);
}

runMigration(migrationFile);
