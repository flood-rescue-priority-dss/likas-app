const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client from PostgreSQL pool:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL Database.');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
