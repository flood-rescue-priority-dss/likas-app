const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get all barangay accounts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, office_name, office_reference_no, city_municipality, zone, registered_email, status, archived_at FROM users WHERE role = $1 ORDER BY office_name ASC',
      ['barangay']
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching accounts:', err);
    res.status(500).json({ error: 'Server error fetching accounts' });
  }
});

// Create a new account
router.post('/', async (req, res) => {
  const { office_name, office_reference_no, zone, city_municipality, email, password } = req.body;

  try {
    // Check if email exists
    const emailCheck = await pool.query('SELECT * FROM users WHERE registered_email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newId = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (
        id, office_name, city_municipality, zone, region, office_contact, 
        office_reference_no, registered_email, role, password_hash, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        newId, 
        office_name, 
        city_municipality || 'Manila', 
        zone || '', 
        'NCR', // Default region
        'N/A', // Default contact
        office_reference_no, 
        email, 
        'barangay', 
        password_hash,
        'Active'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ error: 'Server error creating account' });
  }
});

// Archive an account
router.put('/:id/archive', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE users SET status = 'Archived', archived_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error archiving account:', err);
    res.status(500).json({ error: 'Server error archiving account' });
  }
});

// Reactivate an account
router.put('/:id/reactivate', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE users SET status = 'Active', archived_at = NULL WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error reactivating account:', err);
    res.status(500).json({ error: 'Server error reactivating account' });
  }
});

// Edit an account (basic fields)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { office_name, office_reference_no, zone, city_municipality, email, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET office_name = $1, office_reference_no = $2, zone = $3, city_municipality = $4, registered_email = $5, status = $6
       WHERE id = $7 RETURNING *`,
      [office_name, office_reference_no, zone, city_municipality, email, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(500).json({ error: 'Server error updating account' });
  }
});

module.exports = router;
