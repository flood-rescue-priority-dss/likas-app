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

    if (isAdmin) {
      // Admin: Global stats
      totalPop = 1877400; // Manila total
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

      // Top Streets by Priority Score
      const resTopStreets = await pool.query(`
        SELECT b.name as barangay, s.street_name as street, s.priority as level
        FROM street_registry s
        JOIN barangays b ON s.barangay_id = b.id
        WHERE s.priority = 'High' OR s.priority = 'Very High'
        ORDER BY s.priority_score DESC
        LIMIT 5
      `);
      topStreets = resTopStreets.rows.map(r => ({
        barangay: r.barangay,
        street: r.street,
        level: 'High' // Map 'Very High' to 'High' for display as requested
      }));

    } else {
      // Barangay: Scoped stats
      const resBrgy = await pool.query("SELECT population FROM barangays WHERE id = $1", [brgyId]);
      totalPop = resBrgy.rows[0] ? resBrgy.rows[0].population : 0;

      const resVuln = await pool.query(`
        SELECT COALESCE(SUM(pwd), 0) as pwd, COALESCE(SUM(elderly), 0) as senior, 
               COALESCE(SUM(children), 0) as children, COALESCE(SUM(pregnant), 0) as pregnant
        FROM street_vulnerabilities WHERE barangay_id = $1
      `, [brgyId]);
      if (resVuln.rows[0]) {
        pwd = parseInt(resVuln.rows[0].pwd, 10);
        senior = parseInt(resVuln.rows[0].senior, 10);
        children = parseInt(resVuln.rows[0].children, 10);
        pregnant = parseInt(resVuln.rows[0].pregnant, 10);
      }

      const resStreets = await pool.query("SELECT COUNT(*) FROM street_registry WHERE barangay_id = $1", [brgyId]);
      totalStreets = parseInt(resStreets.rows[0].count, 10);

      const resFloods = await pool.query("SELECT COUNT(*) FROM flood_incidents WHERE barangay_id = $1", [brgyId]);
      totalFloodRecords = parseInt(resFloods.rows[0].count, 10);

      const resHighPrio = await pool.query("SELECT COUNT(*) FROM street_registry WHERE priority IN ('High', 'Very High') AND barangay_id = $1", [brgyId]);
      highPriorityAreas = parseInt(resHighPrio.rows[0].count, 10);

      const resTopStreets = await pool.query(`
        SELECT b.name as barangay, s.street_name as street, s.priority as level
        FROM street_registry s
        JOIN barangays b ON s.barangay_id = b.id
        WHERE (s.priority = 'High' OR s.priority = 'Very High') AND s.barangay_id = $1
        ORDER BY s.priority_score DESC
        LIMIT 5
      `, [brgyId]);
      topStreets = resTopStreets.rows.map(r => ({
        barangay: r.barangay,
        street: r.street,
        level: 'High' // Map 'Very High' to 'High' for display as requested
      }));
    }

    const general = totalPop - (senior + pwd + children + pregnant);
    const populationDistribution = [
      { label: 'General Residents', count: general, color: '#1B75BC' },
      { label: 'Children', count: children, color: '#38BDF8' },
      { label: 'PWDs', count: pwd, color: '#F59E0B' },
      { label: 'Pregnant Women', count: pregnant, color: '#EC4899' },
      { label: 'Senior Citizens', count: senior, color: '#10B981' }
    ].sort((a, b) => b.count - a.count); // Sort descending

    res.json({
      totalPopulation: totalPop,
      totalStreets,
      totalFloodRecords,
      highPriorityAreas,
      populationDistribution,
      topStreets
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
