const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const brgyId = req.user.id;
    let actBrgyId = null;

    if (!isAdmin) {
      try {
        const userRes = await pool.query('SELECT office_name FROM users WHERE id = $1', [brgyId]);
        if (userRes.rows.length > 0) {
          const officeName = userRes.rows[0].office_name;
          const bRes = await pool.query('SELECT id FROM barangays WHERE LOWER(name) = LOWER($1)', [officeName]);
          if (bRes.rows.length > 0) actBrgyId = bRes.rows[0].id;
        }
      } catch (err) { console.error(err); }
    }

    const whereClause = !isAdmin && actBrgyId ? `WHERE barangay_id = $1` : (!isAdmin ? `WHERE 1=0` : ``);
    const params = (!isAdmin && actBrgyId) ? [actBrgyId] : [];

    // 1. Flood Trends Over Time (Group by Month)
    const trendsQuery = `
      SELECT TO_CHAR(incident_date, 'Mon YYYY') as month, COUNT(*) as count, MIN(incident_date) as order_date
      FROM flood_incidents
      ${whereClause}
      GROUP BY TO_CHAR(incident_date, 'Mon YYYY')
      ORDER BY MIN(incident_date) ASC
      LIMIT 12
    `;
    const trendsRes = await pool.query(trendsQuery, params);
    const trendsData = trendsRes.rows.map(r => ({ month: r.month, incidents: parseInt(r.count, 10) }));

    // 2. Primary Causes
    const causesQuery = `
      SELECT cause as name, COUNT(*) as value
      FROM flood_incidents
      ${whereClause}
      GROUP BY cause
    `;
    const causesRes = await pool.query(causesQuery, params);
    const causeColors = {
      'Heavy Rainfall': '#3b82f6',
      'Tropical Cyclone': '#f59e0b',
      'High Tide': '#10b981',
      'Infrastructure Failure': '#ef4444'
    };
    const causesData = causesRes.rows.map(r => ({
      name: r.name,
      value: parseInt(r.value, 10),
      color: causeColors[r.name] || '#8b5cf6'
    }));

    // 3. Priority Distribution
    const priorityQuery = `
      SELECT CASE WHEN priority = 'Very High' THEN 'High' ELSE priority END as priority, COUNT(*) as count
      FROM street_registry
      ${whereClause}
      GROUP BY CASE WHEN priority = 'Very High' THEN 'High' ELSE priority END
    `;
    const priorityRes = await pool.query(priorityQuery, params);
    const priorityData = [
      { priority: 'High', count: 0 },
      { priority: 'Medium', count: 0 },
      { priority: 'Low', count: 0 }
    ];
    priorityRes.rows.forEach(r => {
      const p = priorityData.find(pd => pd.priority === r.priority);
      if (p) p.count = parseInt(r.count, 10);
    });

    // 4. Time of Day Analysis
    const timeQuery = `
      SELECT EXTRACT(HOUR FROM incident_time) as hour
      FROM flood_incidents
      ${whereClause}
    `;
    const timeRes = await pool.query(timeQuery, params);
    let morning = 0, afternoon = 0, evening = 0, night = 0;
    
    timeRes.rows.forEach(r => {
      const hour = parseInt(r.hour, 10);
      if (hour >= 6 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) afternoon++;
      else if (hour >= 18 && hour < 24) evening++;
      else night++;
    });
    
    const timeOfDayData = [
      { period: 'Morning (6am-12pm)', count: morning },
      { period: 'Afternoon (12pm-6pm)', count: afternoon },
      { period: 'Evening (6pm-12am)', count: evening },
      { period: 'Night (12am-6am)', count: night }
    ];

    res.json({
      trends: trendsData,
      causes: causesData,
      priorities: priorityData,
      timeOfDay: timeOfDayData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
