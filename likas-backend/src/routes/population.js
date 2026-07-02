const express = require('express');
const { STREET_VULNERABILITIES, BARANGAY_VULNERABILITIES } = require('../data/baseline');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/streets/:barangayId', verifyToken, (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const records = STREET_VULNERABILITIES.filter(sv => sv.barangayId === req.params.barangayId);
  res.json(records);
});

router.get('/barangays', verifyToken, (req, res) => {
  let records = BARANGAY_VULNERABILITIES;
  if (req.user.role === 'barangay') {
    records = records.filter(bv => bv.id === req.user.id);
  }
  res.json(records);
});

router.put('/streets/:streetId', verifyToken, (req, res) => {
  const idx = STREET_VULNERABILITIES.findIndex(sv => sv.id === req.params.streetId);
  if (idx === -1) return res.status(404).json({ error: 'Street not found' });
  
  STREET_VULNERABILITIES[idx] = {
    ...STREET_VULNERABILITIES[idx],
    ...req.body,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  
  res.json(STREET_VULNERABILITIES[idx]);
});

module.exports = router;
