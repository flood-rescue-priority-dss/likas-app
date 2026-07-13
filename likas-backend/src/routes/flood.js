const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/flood-attachments');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and JPEG files are allowed!'));
    }
  }
});

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

// GET /flood/years - Get all unique years from flood incidents
router.get('/years', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM incident_date)::INTEGER AS year 
       FROM flood_incidents 
       ORDER BY year DESC`
    );
    res.json(rows.map(r => r.year));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const { districtId, cityId, barangayId, approvalStatus, year } = req.query;
  
  try {
    let query = `
      SELECT f.id, f.barangay_id AS "barangayId", TO_CHAR(f.incident_date, 'YYYY-MM-DD') AS "date", 
             TO_CHAR(f.incident_time, 'HH24:MI') AS "time", f.street, f.depth_inches AS "depthInches", 
             f.status, f.cause, f.priority, f.logged_by_role AS "loggedByRole",
             f.logged_by_email AS "loggedByEmail",
             f.approval_status AS "approvalStatus", b.name AS "barangayName",
             f.vulnerability_class AS "vulnerabilityClass", f.hazard_class AS "hazardClass",
             f.priority_source AS "prioritySource"
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
    
    if (year) {
      query += ` AND EXTRACT(YEAR FROM f.incident_date) = $${paramCount}`;
      params.push(year);
      paramCount++;
    }
    
    query += ' ORDER BY f.incident_date DESC, f.incident_time DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
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
              approval_status AS "approvalStatus",
              vulnerability_class AS "vulnerabilityClass", hazard_class AS "hazardClass",
              priority_source AS "prioritySource"
       FROM flood_incidents 
       WHERE barangay_id = $1`,
      [actualBarangayId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

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

// HYBRID ENGINE INTEGRATION
async function getHybridScore(pool, barangayId, depthInches, status, cause) {
  try {
    const bRes = await pool.query(
      'SELECT population, elderly, pwd, pregnant, children, district_id FROM barangays WHERE id = $1',
      [barangayId]
    );
    if (bRes.rows.length === 0) throw new Error('Barangay not found');
    const b = bRes.rows[0];

    const cityRes = await pool.query('SELECT SUM(population) as total FROM barangays');
    const totalCityPop = parseInt(cityRes.rows[0].total, 10);

    const freqRes = await pool.query(
      'SELECT COUNT(*) as cnt FROM flood_incidents WHERE barangay_id = $1',
      [barangayId]
    );
    const freqCount = parseInt(freqRes.rows[0].cnt, 10) + 1; // +1 for the new incident being logged

    const response = await fetch('http://127.0.0.1:8000/api/score/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flood_depth_inches: Number(depthInches),
        status: status,
        cause: cause,
        frequency_count: freqCount,
        population: b.population,
        elderly: b.elderly,
        pwd: b.pwd,
        pregnant: b.pregnant,
        children: b.children,
        total_city_population: totalCityPop,
        district_id: b.district_id || '1'
      })
    });
    
    if (!response.ok) {
      console.error('Python API Error:', await response.text());
      throw new Error('Python API request failed');
    }

    return await response.json();
  } catch (err) {
    console.error('Error getting hybrid score:', err);
    // Fallback to old system if Python is down
    return {
      vulnerability_class: 'Medium',
      hazard_class: 'Medium',
      priority_class: calcPriority(depthInches),
      priority_source: 'formula_old'
    };
  }
}

router.post('/:barangayId', verifyToken, upload.single('remarksAttachment'), async (req, res) => {
  const actualBarangayId = await resolveActualBarangayId(pool, req.params.barangayId, req.user);
  const userActualBarangayId = await resolveActualBarangayId(pool, req.user.id, req.user);

  if (req.user.role === 'barangay' && userActualBarangayId !== actualBarangayId) {
    return res.status(403).json({ error: 'Unauthorized to post other barangay data' });
  }

  try {
    const newId = `fi-${Date.now()}`;
    const { date, time, street, depthInches, cause, force } = req.body;
    
    // Get file path if uploaded
    const remarksAttachment = req.file ? `/uploads/flood-attachments/${req.file.filename}` : null;
    
    const status = calcStatus(depthInches);
    
    // CALL PYTHON ML API
    const mlData = await getHybridScore(pool, actualBarangayId, depthInches, status, cause);
    const priority = mlData.priority_class;
    const vulnerabilityClass = mlData.vulnerability_class;
    const hazardClass = mlData.hazard_class;
    const prioritySource = mlData.priority_source;
    
    const loggedByRole = req.user.role;
    const approvalStatus = loggedByRole === 'admin' ? 'Approved' : 'Pending';

    // Get the authenticated user's email from the database
    const userRes = await pool.query('SELECT registered_email FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }
    const loggedByEmail = userRes.rows[0].registered_email;

    if (!force) {
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
       (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority, logged_by_role, logged_by_email, approval_status, vulnerability_class, hazard_class, priority_source, remarks_attachment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [newId, actualBarangayId, date, time, street, depthInches, status, cause, priority, loggedByRole, loggedByEmail, approvalStatus, vulnerabilityClass, hazardClass, prioritySource, remarksAttachment]
    );

    res.status(201).json({ 
        id: newId, barangayId: actualBarangayId, loggedByRole, loggedByEmail, approvalStatus, ...req.body, 
        status, priority, vulnerabilityClass, hazardClass, prioritySource, remarksAttachment 
    });
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

router.put('/incident/:incidentId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can edit incidents' });
    }

    const { incidentId } = req.params;
    const { date, time, street, depthInches, cause } = req.body;

    const status = calcStatus(depthInches);
    
    // Need barangayId to call Python ML
    const incRes = await pool.query('SELECT barangay_id FROM flood_incidents WHERE id = $1', [incidentId]);
    if (incRes.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    const bId = incRes.rows[0].barangay_id;
    
    // CALL PYTHON ML API
    const mlData = await getHybridScore(pool, bId, depthInches, status, cause);
    const priority = mlData.priority_class;
    const vulnerabilityClass = mlData.vulnerability_class;
    const hazardClass = mlData.hazard_class;
    const prioritySource = mlData.priority_source;

    const { rows } = await pool.query(
      `UPDATE flood_incidents 
       SET incident_date = $1, incident_time = $2, street = $3, 
           depth_inches = $4, cause = $5, priority = $6, status = $7,
           vulnerability_class = $8, hazard_class = $9, priority_source = $10
       WHERE id = $11
       RETURNING id, barangay_id AS "barangayId", TO_CHAR(incident_date, 'YYYY-MM-DD') AS "date", 
                 TO_CHAR(incident_time, 'HH24:MI') AS "time", street, depth_inches AS "depthInches", 
                 status, cause, priority, logged_by_role AS "loggedByRole", logged_by_email AS "loggedByEmail",
                 vulnerability_class AS "vulnerabilityClass", hazard_class AS "hazardClass",
                 priority_source AS "prioritySource"`,
      [date, time, street, depthInches, cause, priority, status, vulnerabilityClass, hazardClass, prioritySource, incidentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

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

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

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

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
