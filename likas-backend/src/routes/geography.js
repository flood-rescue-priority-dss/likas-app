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

router.get('/cities/:id/barangays', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, city_id AS "cityId", name, population, lat, lng FROM barangays WHERE city_id = $1', [req.params.id]);
    
    // Format coordinates to match frontend expectations
    const formattedRows = rows.map(r => ({
      id: r.id,
      cityId: r.cityId,
      name: r.name,
      population: r.population,
      lat: r.lat,
      lng: r.lng
    }));
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/barangays/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, city_id AS "cityId", name, population, lat, lng FROM barangays WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Barangay not found' });
    
    const r = rows[0];
    res.json({
      id: r.id,
      cityId: r.cityId,
      name: r.name,
      population: r.population,
      lat: r.lat,
      lng: r.lng
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
