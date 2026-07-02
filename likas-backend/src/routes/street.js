const express = require('express');
const { STREET_REGISTRY } = require('../data/baseline');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:barangayId', verifyToken, (req, res) => {
  if (req.user.role === 'barangay' && req.user.id !== req.params.barangayId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const records = STREET_REGISTRY.filter(sr => sr.barangayId === req.params.barangayId);
  res.json(records);
});

module.exports = router;
