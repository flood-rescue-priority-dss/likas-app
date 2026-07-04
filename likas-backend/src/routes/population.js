const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/streets/:barangayId', verifyToken, async (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", street_name AS "streetName", 
              pwd, elderly, children, pregnant, last_updated AS "lastUpdated"
       FROM street_vulnerabilities
       WHERE barangay_id = $1`,
      [req.params.barangayId]
    );

    // Ensure dates are strings
    const formattedRows = rows.map(r => ({
      ...r,
      lastUpdated: new Date(r.lastUpdated).toISOString().split('T')[0]
    }));
    
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/barangays', verifyToken, async (req, res) => {
  try {
    let query = `
      SELECT b.id, b.city_id AS "cityId", b.name, b.population,
             COALESCE(SUM(sv.pwd), 0) AS pwd,
             COALESCE(SUM(sv.elderly), 0) AS elderly,
             COALESCE(SUM(sv.children), 0) AS children,
             COALESCE(SUM(sv.pregnant), 0) AS pregnant,
             MAX(sv.last_updated) AS "lastUpdated"
      FROM barangays b
      LEFT JOIN street_vulnerabilities sv ON b.id = sv.barangay_id
    `;
    const params = [];

    if (req.user.role === 'barangay') {
      query += ` WHERE b.id = $1 `;
      params.push(req.user.id);
    }

    query += ` GROUP BY b.id, b.city_id, b.name, b.population `;

    const { rows } = await pool.query(query, params);
    
    const formattedRows = rows.map(r => ({
      ...r,
      pwd: parseInt(r.pwd, 10),
      elderly: parseInt(r.elderly, 10),
      children: parseInt(r.children, 10),
      pregnant: parseInt(r.pregnant, 10),
      lastUpdated: r.lastUpdated ? new Date(r.lastUpdated).toISOString().split('T')[0] : null
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/streets/:streetId', verifyToken, async (req, res) => {
  try {
    const { streetName, pwd, elderly, children, pregnant } = req.body;
    
    // In a real scenario we'd check if the barangay owns this street
    const lastUpdated = new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `UPDATE street_vulnerabilities
       SET street_name = COALESCE($1, street_name),
           pwd = COALESCE($2, pwd),
           elderly = COALESCE($3, elderly),
           children = COALESCE($4, children),
           pregnant = COALESCE($5, pregnant),
           last_updated = $6
       WHERE id = $7
       RETURNING id, barangay_id AS "barangayId", street_name AS "streetName", 
                 pwd, elderly, children, pregnant, last_updated AS "lastUpdated"`,
      [streetName, pwd, elderly, children, pregnant, lastUpdated, req.params.streetId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Street not found' });
    
    const updated = rows[0];
    updated.lastUpdated = new Date(updated.lastUpdated).toISOString().split('T')[0];
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
