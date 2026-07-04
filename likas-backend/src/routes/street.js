const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

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
