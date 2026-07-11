const express = require('express');
const { pool } = require('../db/index');

const router = express.Router();

router.get('/districts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM districts');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/districts/:id/cities', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, district_id AS "districtId", name FROM cities WHERE district_id = $1', [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// All barangays within a district. `barangays` has no district_id column --
// district is derived by joining through cities (barangays.city_id ->
// cities.id -> cities.district_id).
router.get('/districts/:id/barangays', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.city_id AS "cityId", c.district_id AS "districtId",
              b.name, b.population, b.lat, b.lng
       FROM barangays b
       JOIN cities c ON c.id = b.city_id
       WHERE c.district_id = $1
       ORDER BY b.name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/cities/:id/barangays', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.city_id AS "cityId", c.district_id AS "districtId",
              b.name, b.population, b.lat, b.lng
       FROM barangays b
       JOIN cities c ON c.id = b.city_id
       WHERE b.city_id = $1
       ORDER BY b.name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/barangays', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, lat, lng FROM barangays ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/barangays/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.city_id AS "cityId", c.district_id AS "districtId",
              b.name, b.population, b.lat, b.lng
       FROM barangays b
       JOIN cities c ON c.id = b.city_id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Barangay not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
