const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Wildcard route with optional filtering
router.get('/', verifyToken, async (req, res) => {
  const { districtId, cityId, barangayId } = req.query;
  
  try {
    let query = `
      SELECT DISTINCT s.id, s.barangay_id AS "barangayId", s.street_name AS "streetName", 
             s.priority_score AS "priorityScore", s.vulnerability_score AS "vulnerabilityScore", 
             s.priority, s.flood_count AS "floodCount", s.last_updated AS "lastUpdated", s.lat, s.lng 
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
    
    if (barangayId && barangayId !== 'ALL') {
      query += ` AND b.id = $${paramCount}`;
      params.push(barangayId);
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
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", street_name AS "streetName", 
              priority_score AS "priorityScore", vulnerability_score AS "vulnerabilityScore", 
              priority, flood_count AS "floodCount", last_updated AS "lastUpdated", lat, lng 
       FROM street_registry 
       WHERE barangay_id = $1`, 
      [req.params.barangayId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
