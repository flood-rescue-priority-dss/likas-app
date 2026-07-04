const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const mapUser = (row) => ({
  id: row.id,
  officeName: row.office_name,
  cityMunicipality: row.city_municipality,
  zone: row.zone,
  region: row.region,
  officeContact: row.office_contact,
  officeReferenceNo: row.office_reference_no,
  registeredEmail: row.registered_email,
  role: row.role,
  passwordHash: row.password_hash,
  lastLogin: row.last_login
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE registered_email = $1', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = mapUser(rows[0]);

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const userWithoutHash = { ...user };
    delete userWithoutHash.passwordHash;

    res.json({ user: userWithoutHash, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/verify-password', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    
    if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.json({ verified: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = mapUser(rows[0]);
    delete user.passwordHash;
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register-barangay', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register new accounts' });
    }

    const { id, officeName, email, password } = req.body;
    
    // Check if exists
    const checkRes = await pool.query('SELECT id FROM users WHERE id = $1 OR registered_email = $2', [id, email]);
    if (checkRes.rows.length > 0) {
      return res.status(400).json({ error: 'Barangay ID or Email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const officeReferenceNo = `MLA-${id.toUpperCase()}`;

    const { rows } = await pool.query(
      `INSERT INTO users 
       (id, office_name, city_municipality, zone, region, office_contact, office_reference_no, registered_email, role, password_hash) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, officeName, 'Manila City', 'N/A', 'NCR', 'N/A', officeReferenceNo, email, 'barangay', passwordHash]
    );

    const user = mapUser(rows[0]);
    delete user.passwordHash;

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
