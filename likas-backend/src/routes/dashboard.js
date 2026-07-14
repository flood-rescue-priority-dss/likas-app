const express = require('express');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const brgyId = req.user.id;

    let totalPop = 0, senior = 0, pwd = 0, children = 0, pregnant = 0;
    let highPriorityAreas = 0, totalFloodRecords = 0, totalStreets = 0;
    let topStreets = [];
    let barangayInfo = null; // populated for barangay-role users, null for admin

    // Admin: city-wide population total
    if (isAdmin) {
      const resTotalPop = await pool.query("SELECT SUM(population) FROM barangays");
      totalPop = parseInt(resTotalPop.rows[0].sum, 10) || 0;
    }

    if (isAdmin) {
      // Admin: Global stats
      
      senior = Math.floor(totalPop * 0.12);
      pwd = Math.floor(totalPop * 0.05);
      children = Math.floor(totalPop * 0.28);
      pregnant = Math.floor(totalPop * 0.02);

      const resStreets = await pool.query("SELECT COUNT(*) FROM street_registry");
      totalStreets = parseInt(resStreets.rows[0].count, 10) || 3482; // fallback to 3482 if empty

      const resFloods = await pool.query("SELECT COUNT(*) FROM flood_incidents");
      totalFloodRecords = parseInt(resFloods.rows[0].count, 10);

      const resHighPrio = await pool.query("SELECT COUNT(*) FROM street_registry WHERE priority IN ('High', 'Very High')");
      highPriorityAreas = parseInt(resHighPrio.rows[0].count, 10);

      // Top Streets by Priority Score (full details)
      const resTopStreets = await pool.query(`
        SELECT * FROM (
          SELECT DISTINCT ON (s.street_name)
            s.id,
            s.street_name as "streetName", 
            b.name as barangay, 
            CASE WHEN s.priority = 'Very High' THEN 'High' ELSE s.priority END as priority, 
            s.priority_score as "priorityScore",
            s.vulnerability_score as "vulnerabilityScore",
            s.flood_count as "floodCount",
            s.lat,
            s.lng
          FROM street_registry s
          JOIN barangays b ON s.barangay_id = b.id
          ORDER BY s.street_name
        ) sub
        ORDER BY "priorityScore" DESC
        LIMIT 5
      `);
      topStreets = resTopStreets.rows;

    } else {
      // Barangay: Scoped stats
      let actualBrgyId = null;
      try {
        // Fetch office name from user
        const userRes = await pool.query('SELECT office_name FROM users WHERE id = $1', [brgyId]);
        if (userRes.rows.length > 0) {
          const officeName = userRes.rows[0].office_name;
          // Find matching barangay in barangays table
          const bRes = await pool.query('SELECT id, name, population, lat, lng FROM barangays WHERE LOWER(name) = LOWER($1)', [officeName]);
          if (bRes.rows.length > 0) {
            actualBrgyId = bRes.rows[0].id;
            totalPop = parseInt(bRes.rows[0].population, 10) || 0;
            barangayInfo = {
              id:   actualBrgyId,
              name: bRes.rows[0].name,
              lat:  parseFloat(bRes.rows[0].lat),
              lng:  parseFloat(bRes.rows[0].lng),
            };
          }
        }
      } catch (err) { console.error(err); }

      if (actualBrgyId) {
        const resVuln = await pool.query(`
          SELECT COALESCE(SUM(pwd), 0) as pwd, COALESCE(SUM(elderly), 0) as senior, 
                 COALESCE(SUM(children), 0) as children, COALESCE(SUM(pregnant), 0) as pregnant
          FROM street_vulnerabilities WHERE barangay_id = $1
        `, [actualBrgyId]);
        if (resVuln.rows[0]) {
          pwd = parseInt(resVuln.rows[0].pwd, 10);
          senior = parseInt(resVuln.rows[0].senior, 10);
          children = parseInt(resVuln.rows[0].children, 10);
          pregnant = parseInt(resVuln.rows[0].pregnant, 10);
        }

        const resStreets = await pool.query("SELECT COUNT(*) FROM street_registry WHERE barangay_id = $1", [actualBrgyId]);
        totalStreets = parseInt(resStreets.rows[0].count, 10);

        const resFloods = await pool.query("SELECT COUNT(*) FROM flood_incidents WHERE barangay_id = $1", [actualBrgyId]);
        totalFloodRecords = parseInt(resFloods.rows[0].count, 10);

        const resHighPrio = await pool.query("SELECT COUNT(*) FROM street_registry WHERE priority IN ('High', 'Very High') AND barangay_id = $1", [actualBrgyId]);
        highPriorityAreas = parseInt(resHighPrio.rows[0].count, 10);

        const resTopStreets = await pool.query(`
          SELECT * FROM (
            SELECT DISTINCT ON (s.street_name)
              s.id,
              s.street_name as "streetName", 
              b.name as barangay, 
              CASE WHEN s.priority = 'Very High' THEN 'High' ELSE s.priority END as priority, 
              s.priority_score as "priorityScore",
              s.vulnerability_score as "vulnerabilityScore",
              s.flood_count as "floodCount",
              s.lat,
              s.lng
            FROM street_registry s
            JOIN barangays b ON s.barangay_id = b.id
            WHERE s.barangay_id = $1
            ORDER BY s.street_name
          ) sub
          ORDER BY "priorityScore" DESC
          LIMIT 5
        `, [actualBrgyId]);
        topStreets = resTopStreets.rows;
      }
    }

    let populationComparison = [];
    if (isAdmin) {
      // Top 5 populated barangays for comparison
      const resPop = await pool.query(`
        SELECT b.id, b.name as label, b.population as count, 
               COALESCE(SUM(sv.pwd), 0) as pwd,
               COALESCE(SUM(sv.elderly), 0) as senior,
               COALESCE(SUM(sv.children), 0) as children,
               COALESCE(SUM(sv.pregnant), 0) as pregnant
        FROM barangays b
        LEFT JOIN street_vulnerabilities sv ON b.id = sv.barangay_id
        GROUP BY b.id, b.name, b.population
        ORDER BY b.population DESC 
        LIMIT 5
      `);
      const colors = ['#1B75BC', '#38BDF8', '#F59E0B', '#EC4899', '#10B981'];
      populationComparison = resPop.rows.map((r, i) => {
        const count = parseInt(r.count, 10);
        let pwd = parseInt(r.pwd, 10);
        let senior = parseInt(r.senior, 10);
        let children = parseInt(r.children, 10);
        let pregnant = parseInt(r.pregnant, 10);

        // Fallback to city-wide averages if data is missing for the demo
        if (pwd === 0 && senior === 0 && children === 0 && pregnant === 0) {
          pwd = Math.floor(count * 0.05);
          senior = Math.floor(count * 0.12);
          children = Math.floor(count * 0.28);
          pregnant = Math.floor(count * 0.02);
        }

        const totalVulnerable = pwd + senior + children + pregnant;
        // Ensure vulnerabilities don't exceed 80% of the population due to mock data inconsistencies
        if (totalVulnerable > count * 0.8) {
          const scale = (count * 0.8) / totalVulnerable;
          pwd = Math.floor(pwd * scale);
          senior = Math.floor(senior * scale);
          children = Math.floor(children * scale);
          pregnant = Math.floor(pregnant * scale);
        }

        const general = count - (pwd + senior + children + pregnant);
        return {
          id: r.id,
          label: r.label,
          count,
          pwd,
          senior,
          children,
          pregnant,
          general: general > 0 ? general : 0,
          color: colors[i % colors.length]
        };
      });
    }

      // Recent Floods
      let recentQuery = `
        SELECT f.id, f.barangay_id AS "barangayId", b.name AS "barangayName", 
               TO_CHAR(f.incident_date, 'YYYY-MM-DD') AS "date", TO_CHAR(f.incident_time, 'HH24:MI') AS "time", 
               f.street, f.depth_inches AS "depthInches", 
               f.status, f.cause, f.priority, f.logged_by_role AS "loggedByRole",
               f.logged_by_email AS "loggedByEmail"
        FROM flood_incidents f
        JOIN barangays b ON f.barangay_id = b.id
      `;
      let recentParams = [];
      if (!isAdmin) {
        // use the same lookup for recent floods
        try {
          const uRes = await pool.query('SELECT office_name FROM users WHERE id = $1', [brgyId]);
          if (uRes.rows.length > 0) {
            recentQuery += ` WHERE LOWER(b.name) = LOWER($1) `;
            recentParams.push(uRes.rows[0].office_name);
          } else {
            recentQuery += ` WHERE 1=0 `;
          }
        } catch(e) { recentQuery += ` WHERE 1=0 `; }
      }
      recentQuery += ` ORDER BY f.incident_date DESC, f.incident_time DESC LIMIT 5`;
      const resRecent = await pool.query(recentQuery, recentParams);

    res.json({
      totalPopulation: totalPop,
      totalStreets,
      totalFloodRecords,
      highPriorityAreas,
      populationComparison,
      topStreets,
      recentFloods: resRecent.rows,
      barangayInfo,  // null for admin; { id, name, lat, lng } for barangay users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/population-comparison', verifyToken, async (req, res) => {
  try {
    const { barangayIds } = req.body;
    
    if (!barangayIds || !Array.isArray(barangayIds) || barangayIds.length === 0) {
      return res.json([]);
    }

    const placeholders = barangayIds.map((_, i) => `$${i + 1}`).join(',');

    const query = `
      SELECT b.id, b.name as label, b.population as count, 
             COALESCE(SUM(sv.pwd), 0) as pwd,
             COALESCE(SUM(sv.elderly), 0) as senior,
             COALESCE(SUM(sv.children), 0) as children,
             COALESCE(SUM(sv.pregnant), 0) as pregnant
      FROM barangays b
      LEFT JOIN street_vulnerabilities sv ON b.id = sv.barangay_id
      WHERE b.id IN (${placeholders})
      GROUP BY b.id, b.name, b.population
      ORDER BY b.name ASC
    `;

    const resPop = await pool.query(query, barangayIds);
    const colors = ['#1B75BC', '#38BDF8', '#F59E0B', '#EC4899', '#10B981'];
    
    const populationComparison = resPop.rows.map((r, i) => {
      const count = parseInt(r.count, 10);
      let pwd = parseInt(r.pwd, 10);
      let senior = parseInt(r.senior, 10);
      let children = parseInt(r.children, 10);
      let pregnant = parseInt(r.pregnant, 10);

      // Fallback to city-wide averages if data is missing for the demo
      if (pwd === 0 && senior === 0 && children === 0 && pregnant === 0) {
        pwd = Math.floor(count * 0.05);
        senior = Math.floor(count * 0.12);
        children = Math.floor(count * 0.28);
        pregnant = Math.floor(count * 0.02);
      }

      const totalVulnerable = pwd + senior + children + pregnant;
      // Ensure vulnerabilities don't exceed 80% of the population due to mock data inconsistencies
      if (totalVulnerable > count * 0.8) {
        const scale = (count * 0.8) / totalVulnerable;
        pwd = Math.floor(pwd * scale);
        senior = Math.floor(senior * scale);
        children = Math.floor(children * scale);
        pregnant = Math.floor(pregnant * scale);
      }

      const general = count - (pwd + senior + children + pregnant);
      return {
        id: r.id,
        label: r.label,
        count,
        pwd,
        senior,
        children,
        pregnant,
        general: general > 0 ? general : 0,
        color: colors[i % colors.length]
      };
    });

    res.json(populationComparison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
