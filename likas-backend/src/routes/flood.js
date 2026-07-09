const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:barangayId', verifyToken, async (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized to view other barangay data' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", incident_date AS "date", 
              incident_time AS "time", street, depth_inches AS "depthInches", 
              status, cause, priority, logged_by_role AS "loggedByRole"
       FROM flood_incidents 
       WHERE barangay_id = $1`,
      [req.params.barangayId]
    );

    // Ensure dates are formatted correctly for frontend
    const formattedRows = rows.map(r => ({
      ...r,
      date: new Date(r.date).toISOString().split('T')[0],
      time: typeof r.time === 'string' ? r.time.substring(0, 5) : r.time // Keep HH:MM
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:barangayId', verifyToken, async (req, res) => {
  try {
    const newId = `fi-${Date.now()}`;
    const bId = req.params.barangayId;
    const { date, time, street, depthInches, status, cause, priority } = req.body;
    // Role is read exclusively from the verified JWT — cannot be spoofed by the client
    const loggedByRole = req.user.role;

    await pool.query(
      `INSERT INTO flood_incidents 
       (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority, logged_by_role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [newId, bId, date, time, street, depthInches, status, cause, priority, loggedByRole]
    );

    res.status(201).json({ id: newId, barangayId: bId, loggedByRole, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:barangayId/hotspots', verifyToken, async (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized to view other barangay data' });
  }

  try {
    // Generate hotspots dynamically from flood_incidents for the barangay
    // If none exist for this specific barangay, we fallback to a city-wide generic query or static for demo purposes.
    // For now, let's query the specific barangay
    const { rows } = await pool.query(
      `SELECT 
         street, 
         COUNT(*) as "eventCount",
         ROUND(SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as "segmentLow",
         ROUND(SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as "segmentMedium",
         ROUND(SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as "segmentHigh",
         ROUND(SUM(CASE WHEN priority = 'Very High' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as "segmentVeryHigh"
       FROM flood_incidents
       WHERE barangay_id = $1
       GROUP BY street
       ORDER BY "eventCount" DESC
       LIMIT 6`,
       [req.params.barangayId]
    );

    // The frontend chart expects segments to add up to 100 roughly, the above query does that.
    res.json(rows.map(r => ({
      street: r.street,
      eventCount: parseInt(r.eventCount, 10),
      segmentLow: parseFloat(r.segmentLow) || 0,
      segmentMedium: parseFloat(r.segmentMedium) || 0,
      segmentHigh: parseFloat(r.segmentHigh) || 0,
      segmentVeryHigh: parseFloat(r.segmentVeryHigh) || 0
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
