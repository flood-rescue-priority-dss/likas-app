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
    // Primary: look up by exact id
    const { rows } = await pool.query(
      `SELECT b.id, b.city_id AS "cityId", c.district_id AS "districtId",
              b.name, b.population, b.lat, b.lng
       FROM barangays b
       JOIN cities c ON c.id = b.city_id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (rows.length > 0) return res.json(rows[0]);

    // Fallback: the user accounts table uses a different id scheme from the
    // barangays table (e.g. user.id = "u-brgy-676", barangay.id = "b-barangay-676").
    // Try to resolve by deriving the barangay name from the id slug, then
    // doing a case-insensitive name match so callers that pass user.id still work.
    //
    // Slug → name heuristic: strip leading prefix up to the last dash-segment
    // that contains a number. Works for "u-brgy-676" → "Barangay 676",
    // "brgy-676" → "Barangay 676", "brgy-barangay-676" → "Barangay 676".
    const slug = req.params.id;
    const numMatch = slug.match(/(\d+(?:-[a-z])?)\s*$/i);
    if (numMatch) {
      const derivedName = `Barangay ${numMatch[1].toUpperCase()}`;
      const { rows: byName } = await pool.query(
        `SELECT b.id, b.city_id AS "cityId", c.district_id AS "districtId",
                b.name, b.population, b.lat, b.lng
         FROM barangays b
         JOIN cities c ON c.id = b.city_id
         WHERE LOWER(b.name) = LOWER($1)`,
        [derivedName]
      );
      if (byName.length > 0) return res.json(byName[0]);
    }

    return res.status(404).json({ error: 'Barangay not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
