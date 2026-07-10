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

router.get('/streets/:barangayId', verifyToken, async (req, res) => {
  const actualBarangayId = await resolveActualBarangayId(pool, req.params.barangayId, req.user);
  const userActualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);

  if (req.user.role === 'barangay' && userActualBarangayId !== actualBarangayId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", street_name AS "streetName", 
              pwd, elderly, children, pregnant, last_updated AS "lastUpdated"
       FROM street_vulnerabilities
       WHERE barangay_id = $1`,
      [actualBarangayId]
    );

    // If street_vulnerabilities is empty for this barangay, we fallback to generating default records
    // from street_registry dynamically so the UI doesn't look broken/empty.
    if (rows.length === 0) {
      const { rows: registryRows } = await pool.query(
        `SELECT DISTINCT ON (street_name) 
                id, barangay_id AS "barangayId", street_name AS "streetName"
         FROM street_registry
         WHERE barangay_id = $1
         ORDER BY street_name`,
        [actualBarangayId]
      );
      
      const defaultRows = registryRows.map(r => ({
        id: r.id, // Using street_registry id as fallback key
        barangayId: r.barangayId,
        streetName: r.streetName,
        pwd: 0,
        elderly: 0,
        children: 0,
        pregnant: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      }));

      return res.json(defaultRows);
    }

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
      const actualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);
      query += ` WHERE b.id = $1 `;
      params.push(actualBarangayId);
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
    
    const streetId = req.params.streetId;
    const lastUpdated = new Date().toISOString().split('T')[0];

    // Check if it already exists in street_vulnerabilities
    const checkVuln = await pool.query('SELECT * FROM street_vulnerabilities WHERE id = $1', [streetId]);

    let rows;
    if (checkVuln.rows.length === 0) {
      // It's a fallback row! Fetch barangay_id and street_name from street_registry
      const registryRes = await pool.query('SELECT barangay_id, street_name FROM street_registry WHERE id = $1', [streetId]);
      if (registryRes.rows.length === 0) {
         return res.status(404).json({ error: 'Street not found in registry' });
      }
      
      const { barangay_id, street_name } = registryRes.rows[0];

      const insertRes = await pool.query(
        `INSERT INTO street_vulnerabilities (id, barangay_id, street_name, pwd, elderly, children, pregnant, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, barangay_id AS "barangayId", street_name AS "streetName", 
                   pwd, elderly, children, pregnant, last_updated AS "lastUpdated"`,
        [streetId, barangay_id, streetName || street_name, pwd, elderly, children, pregnant, lastUpdated]
      );
      rows = insertRes.rows;
    } else {
      // Normal UPDATE
      const updateRes = await pool.query(
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
        [streetName, pwd, elderly, children, pregnant, lastUpdated, streetId]
      );
      rows = updateRes.rows;
    }

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
