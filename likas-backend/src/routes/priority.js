const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

async function resolveActualBarangayId(pool, providedId, reqUser) {
  if (reqUser.role === 'admin' || !providedId || providedId === 'ALL') {
    return providedId;
  }
  try {
    const userRes = await pool.query('SELECT office_name FROM users WHERE id = $1', [reqUser.id]);
    if (userRes.rows.length > 0) {
      const officeName = userRes.rows[0].office_name;
      const bRes = await pool.query('SELECT id FROM barangays WHERE LOWER(name) = LOWER($1)', [officeName]);
      if (bRes.rows.length > 0) {
        return bRes.rows[0].id;
      }
    }
  } catch (err) {
    console.error('Error resolving actual barangay ID:', err);
  }
  return providedId;
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.query.filter || 'All';
    let query = `
      SELECT * FROM (
        SELECT DISTINCT ON (sr.street_name)
               sr.id, b.id AS "barangayId", b.name AS barangay, sr.street_name AS "streetName",
               sr.priority_score AS "priorityScore", sr.vulnerability_score AS "vulnerabilityScore",
               CASE WHEN sr.priority = 'Very High' THEN 'High' ELSE sr.priority END AS priority,
               sr.flood_count AS "floodCount", sr.last_updated AS "lastUpdated",
               sr.lat, sr.lng
        FROM street_registry sr
        JOIN barangays b ON sr.barangay_id = b.id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (req.user.role === 'barangay') {
      const actualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);
      query += ` AND sr.barangay_id = $${paramIndex} `;
      params.push(actualBarangayId);
      paramIndex++;
    }

    if (filter !== 'All') {
      if (filter === 'High') {
        query += ` AND sr.priority IN ('High', 'Very High') `;
      } else {
        query += ` AND sr.priority = $${paramIndex} `;
        params.push(filter);
        paramIndex++;
      }
    }

    query += `
        ORDER BY sr.street_name
      ) sub
      ORDER BY "priorityScore" DESC
    `;

    const { rows } = await pool.query(query, params);

    // Format dates correctly
    const formattedRows = rows.map(r => ({
      ...r,
      lastUpdated: r.lastUpdated ? new Date(r.lastUpdated).toISOString().split('T')[0] : null
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    require('fs').writeFileSync('error.log', err.stack || err.message);
    res.status(500).json({ error: 'Server error', details: err.message, stack: err.stack });
  }
});

module.exports = router;
