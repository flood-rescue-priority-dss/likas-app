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

// Wildcard route with optional filtering
router.get('/', verifyToken, async (req, res) => {
  let { districtId, cityId, barangayId } = req.query;
  let userOfficeName = null;
  
  if (req.user.role === 'barangay') {
    try {
      const userRes = await pool.query('SELECT office_name FROM users WHERE id = $1', [req.user.id]);
      if (userRes.rows.length > 0) {
        userOfficeName = userRes.rows[0].office_name;
      }
    } catch (err) {
      console.error(err);
    }
  }
  
  try {
    let query = `
      SELECT s.id, s.barangay_id AS "barangayId", s.street_name AS "streetName", 
             s.priority_score AS "priorityScore", s.vulnerability_score AS "vulnerabilityScore", 
             CASE WHEN s.priority = 'Very High' THEN 'High' ELSE s.priority END AS priority, 
             s.flood_count AS "floodCount", s.last_updated AS "lastUpdated", s.lat, s.lng 
      FROM street_registry s
      JOIN barangays b ON s.barangay_id = b.id
      JOIN cities c ON b.city_id = c.id
      JOIN districts d ON c.district_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (districtId && districtId !== 'ALL') {
      query += ` AND d.id = $${paramCount}`;
      params.push(districtId);
      paramCount++;
    }
    
    if (cityId && cityId !== 'ALL') {
      query += ` AND c.id = $${paramCount}`;
      params.push(cityId);
      paramCount++;
    }
    
    const actualBarangayId = await resolveActualBarangayId(pool, barangayId, req.user);
    if (actualBarangayId && actualBarangayId !== 'ALL') {
      query += ` AND b.id = $${paramCount}`;
      params.push(actualBarangayId);
      paramCount++;
    }
    
    // We can still keep the userOfficeName strict filter if userOfficeName was found.
    // However, since we successfully resolved actualBarangayId, it's technically redundant but safe.
    if (userOfficeName) {
      query += ` AND LOWER(b.name) = LOWER($${paramCount})`;
      params.push(userOfficeName);
      paramCount++;
    }
    
    query += ' ORDER BY s.priority_score DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy route for specific barangay (kept for backward compatibility)
router.get('/:barangayId', verifyToken, async (req, res) => {
  const actualBarangayId = await resolveActualBarangayId(pool, req.params.barangayId, req.user);
  const userActualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);

  if (req.user.role === 'barangay' && userActualBarangayId !== actualBarangayId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", street_name AS "streetName", 
              priority_score AS "priorityScore", vulnerability_score AS "vulnerabilityScore", 
              CASE WHEN priority = 'Very High' THEN 'High' ELSE priority END AS priority, 
              flood_count AS "floodCount", last_updated AS "lastUpdated", lat, lng 
       FROM street_registry 
       WHERE barangay_id = $1
       ORDER BY priority_score DESC`, 
      [actualBarangayId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
