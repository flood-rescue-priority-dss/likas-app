const express = require('express');
const { FLOOD_INCIDENTS, RECURRENCE_HOTSPOTS } = require('../data/baseline');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:barangayId', verifyToken, (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized to view other barangay data' });
  }
  const records = FLOOD_INCIDENTS.filter(fi => fi.barangayId === req.params.barangayId);
  res.json(records);
});

router.post('/:barangayId', verifyToken, (req, res) => {
  const newIncident = {
    id: `fi-${Date.now()}`,
    barangayId: req.params.barangayId,
    ...req.body
  };
  FLOOD_INCIDENTS.push(newIncident);
  res.status(201).json(newIncident);
});

router.get('/:barangayId/hotspots', verifyToken, (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized to view other barangay data' });
  }
  // In a real app we would filter by barangayId, but our mock data is limited
  res.json(RECURRENCE_HOTSPOTS);
});

module.exports = router;
