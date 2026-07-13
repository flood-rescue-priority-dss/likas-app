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
  lastLogin: row.last_login,
  mustChangePassword: row.must_change_password === true,
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
    require('fs').writeFileSync('auth_error.log', err.stack || err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// In-memory store for pending email changes: userId -> { newEmail, code, expiresAt }
const pendingEmailChanges = new Map();

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
       (id, office_name, city_municipality, zone, region, office_contact, office_reference_no, registered_email, role, password_hash, must_change_password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
       RETURNING id, office_name, city_municipality, zone, region, office_contact,
                 office_reference_no, registered_email, role, last_login, must_change_password`,
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

// POST /api/auth/change-password
// Body: { currentPassword, newPassword }
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(currentPassword, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/request-email-change
// Body: { newEmail }
// Generates a 6-digit code and (for now) logs it to console.
// Replace the console.log with your email-sending logic when ready.
router.post('/request-email-change', verifyToken, async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ error: 'newEmail is required' });
    }

    // Make sure the new email isn't already taken
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE registered_email = $1 AND id != $2',
      [newEmail, req.user.id]
    );
    if (rows.length > 0) {
      return res.status(409).json({ error: 'That email is already in use' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingEmailChanges.set(req.user.id, { newEmail, code, expiresAt });

    // TODO: replace with real email sending (nodemailer, SendGrid, etc.)
    console.log(`[EMAIL CHANGE] User ${req.user.id} | New email: ${newEmail} | Code: ${code}`);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/confirm-email-change
// Body: { code }
router.post('/confirm-email-change', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    const pending = pendingEmailChanges.get(req.user.id);

    if (!pending) {
      return res.status(400).json({ error: 'No pending email change found. Please request a new code.' });
    }

    if (Date.now() > pending.expiresAt) {
      pendingEmailChanges.delete(req.user.id);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (pending.code !== code.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code' });
    }

    await pool.query(
      'UPDATE users SET registered_email = $1 WHERE id = $2',
      [pending.newEmail, req.user.id]
    );

    pendingEmailChanges.delete(req.user.id);

    res.json({ success: true, newEmail: pending.newEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
