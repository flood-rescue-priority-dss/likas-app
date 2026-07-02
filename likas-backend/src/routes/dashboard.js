const express = require('express');
const { BARANGAYS, FLOOD_INCIDENTS, PRIORITY_LIST, BARANGAY_VULNERABILITIES } = require('../data/baseline');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const brgyId = req.user.id;

  // Filter sources
  const activeBarangays = isAdmin ? BARANGAYS : BARANGAYS.filter(b => b.id === brgyId);
  const incidents = isAdmin ? FLOOD_INCIDENTS : FLOOD_INCIDENTS.filter(fi => fi.barangayId === brgyId);
  const priorityItems = isAdmin ? PRIORITY_LIST : PRIORITY_LIST.filter(pl => {
    const brgy = activeBarangays[0];
    return brgy && pl.barangay === brgy.name;
  });
  const vulns = isAdmin ? BARANGAY_VULNERABILITIES : BARANGAY_VULNERABILITIES.filter(v => v.id === brgyId);

  // Compute Population Distribution
  let totalPop = 0, senior = 0, pwd = 0, children = 0, pregnant = 0;
  
  if (isAdmin) {
    // We mock the total distribution slightly based on a large dataset or just sum up what we have in BARANGAY_VULNERABILITIES
    totalPop = 1877400; // Manila total
    // Rough estimates for Manila based on demographics
    senior = Math.floor(totalPop * 0.12);
    pwd = Math.floor(totalPop * 0.05);
    children = Math.floor(totalPop * 0.28);
    pregnant = Math.floor(totalPop * 0.02);
  } else {
    totalPop = activeBarangays[0]?.population || 0;
    const v = vulns[0];
    if (v) {
      senior = v.senior;
      pwd = v.pwd;
      children = v.children;
      pregnant = v.pregnant;
    }
  }
  
  const general = totalPop - (senior + pwd + children + pregnant);
  
  const populationDistribution = [
    { label: 'General Residents', count: general, color: '#1B75BC' },
    { label: 'Children', count: children, color: '#38BDF8' },
    { label: 'Senior Citizens', count: senior, color: '#10B981' },
    { label: 'PWDs', count: pwd, color: '#F59E0B' },
    { label: 'Pregnant Women', count: pregnant, color: '#EC4899' }
  ];

  const highPriorityAreas = priorityItems.filter(p => p.priority === 'High').length;
  
  // Top Priority Barangays -> Rank, Barangay, Water Depth (in), Level
  // Wait, PRIORITY_LIST has streetName and barangay, and priorityScore. We can use the highest incident depth for waterDepth or just mock it from priority score for now since PRIORITY_LIST doesn't strictly have water depth in the summary.
  // Actually, let's map flood records to get the deepest floods!
  
  // Group incidents by barangay and find max depth
  const brgyDepths = {};
  incidents.forEach(fi => {
    if (!brgyDepths[fi.barangayId] || fi.depthInches > brgyDepths[fi.barangayId].depth) {
      const bName = BARANGAYS.find(b => b.id === fi.barangayId)?.name || fi.barangayId;
      brgyDepths[fi.barangayId] = { name: bName, depth: fi.depthInches, level: fi.priority };
    }
  });

  let topBarangays = Object.values(brgyDepths)
    .sort((a, b) => b.depth - a.depth)
    .slice(0, 5)
    .map(tb => ({
      name: tb.name,
      waterDepth: tb.depth,
      level: tb.level
    }));

  // If no incidents, fallback to priority list items
  if (topBarangays.length === 0) {
    topBarangays = priorityItems.slice(0, 5).map(p => ({
      name: p.barangay,
      waterDepth: Math.round(p.priorityScore / 2), // Mock depth
      level: p.priority
    }));
  }

  const summary = {
    totalPopulation: totalPop,
    totalStreets: isAdmin ? 3482 : (priorityItems.length || 0), // Kept static as requested
    totalFloodRecords: incidents.length,
    highPriorityAreas,
    populationDistribution,
    topBarangays
  };

  res.json(summary);
});

module.exports = router;
