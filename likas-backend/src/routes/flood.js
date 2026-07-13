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
  const { districtId, cityId, barangayId, approvalStatus } = req.query;
  
  try {
    let query = `
      SELECT f.id, f.barangay_id AS "barangayId", TO_CHAR(f.incident_date, 'YYYY-MM-DD') AS "date", 
             TO_CHAR(f.incident_time, 'HH24:MI') AS "time", f.street, f.depth_inches AS "depthInches", 
             f.status, f.cause, f.priority, f.logged_by_role AS "loggedByRole",
             f.logged_by_email AS "loggedByEmail",
             f.approval_status AS "approvalStatus", b.name AS "barangayName"
      FROM flood_incidents f
      JOIN barangays b ON f.barangay_id = b.id
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
    
    let actualBarangayId = await resolveActualBarangayId(pool, barangayId, req.user);
    if (actualBarangayId && actualBarangayId !== 'ALL') {
      query += ` AND b.id = $${paramCount}`;
      params.push(actualBarangayId);
      paramCount++;
    }
    
    if (approvalStatus) {
      query += ` AND f.approval_status = $${paramCount}`;
      params.push(approvalStatus);
      paramCount++;
    }
    
    query += ' ORDER BY f.incident_date DESC, f.incident_time DESC';
    
    const { rows } = await pool.query(query, params);

    // Dates and times are now pre-formatted correctly by PostgreSQL
    const formattedRows = rows;

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:barangayId', verifyToken, async (req, res) => {
  const actualBarangayId = await resolveActualBarangayId(pool, req.params.barangayId, req.user);
  const userActualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);

  if (req.user.role === 'barangay' && userActualBarangayId !== actualBarangayId) {
    return res.status(403).json({ error: 'Unauthorized to view other barangay data' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, barangay_id AS "barangayId", TO_CHAR(incident_date, 'YYYY-MM-DD') AS "date", 
              TO_CHAR(incident_time, 'HH24:MI') AS "time", street, depth_inches AS "depthInches", 
              status, cause, priority, logged_by_role AS "loggedByRole",
              logged_by_email AS "loggedByEmail",
              approval_status AS "approvalStatus"
       FROM flood_incidents 
       WHERE barangay_id = $1`,
      [actualBarangayId]
    );

    // Dates and times are now pre-formatted correctly by PostgreSQL
    const formattedRows = rows;

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Thresholds per DPWH/MDRRMD road-passability classification:
// PATV  (Passable to All Types of Vehicles):        depth <= 8 in
// NPLV  (Not Passable to Light Vehicles):            9 in <= depth <= 19 in
// NPATV (Not Passable to All Types of Vehicles):     depth >= 20 in
function calcStatus(depthInches) {
  const depth = Number(depthInches);
  if (depth >= 20) return 'NPATV';
  if (depth >= 9) return 'NPLV';
  return 'PATV';
}

function calcPriority(depthInches) {
  const depth = Number(depthInches);
  if (depth >= 20) return 'High';
  if (depth >= 10) return 'Medium';
  return 'Low';
}

router.post('/:barangayId', verifyToken, async (req, res) => {
  const actualBarangayId = await resolveActualBarangayId(pool, req.params.barangayId, req.user);
  const userActualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);

  if (req.user.role === 'barangay' && userActualBarangayId !== actualBarangayId) {
    return res.status(403).json({ error: 'Unauthorized to post other barangay data' });
  }

  try {
    const newId = `fi-${Date.now()}`;
    const { date, time, street, depthInches, cause, force } = req.body;
    // status and priority are derived from depthInches server-side — never trust client-supplied values
    const status = calcStatus(depthInches);
    const priority = calcPriority(depthInches);
    // Role is read exclusively from the verified JWT — cannot be spoofed by the client
    const loggedByRole = req.user.role;
    // Default approval_status: admin logs are auto-approved, barangay logs are pending
    const approvalStatus = loggedByRole === 'admin' ? 'Approved' : 'Pending';

    // Get the authenticated user's email from the database
    const userRes = await pool.query('SELECT registered_email FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }
    const loggedByEmail = userRes.rows[0].registered_email;

    if (!force) {
      // Check for exact match (duplicate data)
      const { rows: existing } = await pool.query(
        `SELECT id FROM flood_incidents 
         WHERE barangay_id = $1 AND street = $2 AND incident_date = $3 AND incident_time = $4`,
        [actualBarangayId, street, date, time]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'DuplicateRecord', message: 'There is existing data for this location and time.' });
      }
    }

    await pool.query(
      `INSERT INTO flood_incidents 
       (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority, logged_by_role, logged_by_email, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [newId, actualBarangayId, date, time, street, depthInches, status, cause, priority, loggedByRole, loggedByEmail, approvalStatus]
    );

    res.status(201).json({ id: newId, barangayId: actualBarangayId, loggedByRole, loggedByEmail, approvalStatus, ...req.body, status, priority });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:barangayId/hotspots', verifyToken, async (req, res) => {
  const actualBarangayId = await resolveActualBarangayId(pool, req.params.barangayId, req.user);
  const userActualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);

  if (req.user.role === 'barangay' && userActualBarangayId !== actualBarangayId) {
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
         0 as "segmentVeryHigh"
       FROM flood_incidents
       WHERE barangay_id = $1
       GROUP BY street
       ORDER BY "eventCount" DESC
       LIMIT 6`,
       [actualBarangayId]
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

// PUT /flood/incident/:incidentId - Update flood incident (admin only)
router.put('/incident/:incidentId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can edit incidents' });
    }

    const { incidentId } = req.params;
    const { date, time, street, depthInches, cause } = req.body;

    // Recalculate status and priority from the (possibly edited) depth
    const status = calcStatus(depthInches);
    const priority = calcPriority(depthInches);

    const { rows } = await pool.query(
      `UPDATE flood_incidents 
       SET incident_date = $1, incident_time = $2, street = $3, 
           depth_inches = $4, cause = $5, priority = $6, status = $7
       WHERE id = $8
       RETURNING id, barangay_id AS "barangayId", TO_CHAR(incident_date, 'YYYY-MM-DD') AS "date", 
                 TO_CHAR(incident_time, 'HH24:MI') AS "time", street, depth_inches AS "depthInches", 
                 status, cause, priority, logged_by_role AS "loggedByRole", logged_by_email AS "loggedByEmail"`,
      [date, time, street, depthInches, cause, priority, status, incidentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updated = rows[0];
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /flood/incident/:incidentId - Delete flood incident (admin only, password verified)
router.delete('/incident/:incidentId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete incidents' });
    }

    const { incidentId } = req.params;

    const { rows } = await pool.query(
      'DELETE FROM flood_incidents WHERE id = $1 RETURNING id',
      [incidentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ success: true, id: incidentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /flood/incident/:incidentId/approve - Approve pending incident (admin only)
router.post('/incident/:incidentId/approve', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve incidents' });
    }

    const { incidentId } = req.params;

    const { rows } = await pool.query(
      `UPDATE flood_incidents 
       SET approval_status = 'Approved'
       WHERE id = $1
       RETURNING id, barangay_id AS "barangayId", TO_CHAR(incident_date, 'YYYY-MM-DD') AS "date", 
                 TO_CHAR(incident_time, 'HH24:MI') AS "time", street, depth_inches AS "depthInches", 
                 status, cause, priority, logged_by_role AS "loggedByRole", logged_by_email AS "loggedByEmail",
                 approval_status AS "approvalStatus"`,
      [incidentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const approved = rows[0];
    res.json(approved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /flood/incident/:incidentId/reject - Reject pending incident (admin only)
router.post('/incident/:incidentId/reject', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reject incidents' });
    }

    const { incidentId } = req.params;

    const { rows } = await pool.query(
      `UPDATE flood_incidents 
       SET approval_status = 'Rejected'
       WHERE id = $1
       RETURNING id, barangay_id AS "barangayId", TO_CHAR(incident_date, 'YYYY-MM-DD') AS "date", 
                 TO_CHAR(incident_time, 'HH24:MI') AS "time", street, depth_inches AS "depthInches", 
                 status, cause, priority, logged_by_role AS "loggedByRole", logged_by_email AS "loggedByEmail",
                 approval_status AS "approvalStatus"`,
      [incidentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const rejected = rows[0];
    res.json(rejected);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
