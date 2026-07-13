require('dotenv').config();
const { pool } = require('./index');

async function verify() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT role, COUNT(*) as total,
              COUNT(*) FILTER (WHERE must_change_password = TRUE)  as must_change,
              COUNT(*) FILTER (WHERE must_change_password = FALSE) as no_change
       FROM users GROUP BY role ORDER BY role`
    );
    console.log('=== must_change_password by role ===');
    rows.forEach(r => {
      console.log(`  ${r.role.padEnd(10)} total=${r.total}  must_change=${r.must_change}  no_change=${r.no_change}`);
    });
  } finally {
    client.release();
    pool.end();
  }
}
verify();
