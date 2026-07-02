const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ACCOUNTS } = require('../data/baseline');
const { verifyToken, extractUser } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = ACCOUNTS.find(a => a.registeredEmail === email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const userWithoutHash = { ...user };
  delete userWithoutHash.passwordHash;

  res.json({ user: userWithoutHash, token });
});

router.post('/verify-password', verifyToken, (req, res) => {
  const { password } = req.body;
  const user = ACCOUNTS.find(a => a.id === req.user.id);
  
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  res.json({ verified: true });
});

router.get('/me', verifyToken, (req, res) => {
  const user = extractUser(req);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const userWithoutHash = { ...user };
  delete userWithoutHash.passwordHash;
  
  res.json(userWithoutHash);
});

router.post('/register-barangay', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can register new accounts' });
  }

  const { id, officeName, email, password } = req.body;
  
  if (ACCOUNTS.find(a => a.id === id || a.registeredEmail === email)) {
    return res.status(400).json({ error: 'Barangay ID or Email already exists' });
  }

  const newAccount = {
    id,
    officeName,
    cityMunicipality: 'Manila City',
    zone: 'N/A',
    officeContact: 'N/A',
    officeReferenceNo: `MLA-${id.toUpperCase()}`,
    registeredEmail: email,
    role: 'barangay',
    lastLogin: null,
    passwordHash: bcrypt.hashSync(password, 10)
  };

  ACCOUNTS.push(newAccount);

  const accountWithoutHash = { ...newAccount };
  delete accountWithoutHash.passwordHash;

  res.status(201).json(accountWithoutHash);
});

module.exports = router;
