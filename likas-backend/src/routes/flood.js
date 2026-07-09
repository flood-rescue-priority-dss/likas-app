const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ── GET /flood — all records with optional filters (admin only) ──────────────
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role === 'barangay') {
    // Barangay users are scoped to their own data — redirect to their specific route
    return res.redirect(`/api/flood/${req.user.id}`);
  }

  try {
    const { districtId, cityId, barangayId, startDate, endDate } = req.query;

    const conditions = [];
    const params = [];

    if (barangayId) {
      params.push(barangayId);
      conditions.push(`fi.barangay_id = $${params.length}`);
    } else if (cityId) {
      params.push(cityId);
      conditions.push(`b.city_id = $${params.length}`);
    } else if (districtId) {
      params.push(districtId);
      conditions.push(`c.district_id = $${params.length}`);
    }

    if (startDate) {
      params.push(startDate);
      conditions.push(`fi.incident_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`fi.incident_date <= $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        fi.id,
        fi.barangay_id AS "barangayId",
        fi.incident_date AS "date",
        fi.incident_time AS "time",
        fi.street,
        fi.depth_inches AS "depthInches",
        fi.status,
        fi.cause,
        fi.priority
      FROM flood_incidents fi
      JOIN barangays b ON fi.barangay_id = b.id
      JOIN cities c ON b.city_id = c.id
      ${whereClause}
      ORDER BY fi.incident_date DESC, fi.incident_time DESC
    `;

    const { rows } = await pool.query(query, params);

    const formatted = rows.map(r => ({
      ...r,
      date: new Date(r.date).toISOString().split('T')[0],
      time: typeof r.time === 'string' ? r.time.substring(0, 5) : r.time,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:barangayId', verifyToken, async (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized to view other barangay data' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", incident_date AS "date", 
              incident_time AS "time", street, depth_inches AS "depthInches", 
              status, cause, priority 
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

    await pool.query(
      `INSERT INTO flood_incidents 
       (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [newId, bId, date, time, street, depthInches, status, cause, priority]
    );

    res.status(201).json({ id: newId, barangayId: bId, ...req.body });
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
