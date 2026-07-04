const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.query.filter || 'All';
    let query = `
      SELECT sr.id, b.name AS barangay, sr.street_name AS "streetName",
             sr.priority_score AS "priorityScore", sr.vulnerability_score AS "vulnerabilityScore",
             sr.priority, sr.flood_count AS "floodCount", sr.last_updated AS "lastUpdated"
      FROM street_registry sr
      JOIN barangays b ON sr.barangay_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (req.user.role === 'barangay') {
      query += ` AND sr.barangay_id = $${paramIndex} `;
      params.push(req.user.id);
      paramIndex++;
    }

    if (filter !== 'All') {
      query += ` AND sr.priority = $${paramIndex} `;
      params.push(filter);
      paramIndex++;
    }

    query += ` ORDER BY sr.priority_score DESC `;

    const { rows } = await pool.query(query, params);

    // Format dates correctly
    const formattedRows = rows.map(r => ({
      ...r,
      lastUpdated: r.lastUpdated ? new Date(r.lastUpdated).toISOString().split('T')[0] : null
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
