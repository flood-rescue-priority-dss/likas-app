const express = require('express');
const { PRIORITY_LIST } = require('../data/baseline');
const { verifyToken } = require('../middleware/auth');
const { BARANGAYS } = require('../data/baseline');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const filter = req.query.filter || 'All';
  let filtered = PRIORITY_LIST;
  
  if (req.user.role === 'barangay') {
    const brgy = BARANGAYS.find(b => b.id === req.user.id);
    if (brgy) {
      filtered = filtered.filter(p => p.barangay === brgy.name);
    } else {
      filtered = [];
    }
  }
  
  if (filter !== 'All') {
    filtered = filtered.filter(p => p.priority === filter);
  }
  
  res.json(filtered);
});

module.exports = router;
