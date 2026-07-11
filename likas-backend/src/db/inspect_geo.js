require('dotenv').config();
const { pool } = require('./index');

async function inspect() {
  const client = await pool.connect();
  try {
    const { rows: districts } = await client.query('SELECT id, name FROM districts ORDER BY name');
    console.log('Districts:', JSON.stringify(districts, null, 2));

    const { rows: cities } = await client.query('SELECT id, name, district_id FROM cities ORDER BY district_id, name');
    console.log('\nCities:', JSON.stringify(cities, null, 2));
  } finally {
    client.release();
    pool.end();
  }
}

inspect();
