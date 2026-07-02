const express = require('express');
const { DISTRICTS, CITIES, BARANGAYS } = require('../data/baseline');

const router = express.Router();

router.get('/districts', (req, res) => {
  res.json(DISTRICTS);
});

router.get('/districts/:id/cities', (req, res) => {
  const cities = CITIES.filter(c => c.districtId === req.params.id);
  res.json(cities);
});

router.get('/cities/:id/barangays', (req, res) => {
  const barangays = BARANGAYS.filter(b => b.cityId === req.params.id);
  res.json(barangays);
});

router.get('/barangays/:id', (req, res) => {
  const barangay = BARANGAYS.find(b => b.id === req.params.id);
  if (!barangay) return res.status(404).json({ error: 'Barangay not found' });
  res.json(barangay);
});

module.exports = router;
