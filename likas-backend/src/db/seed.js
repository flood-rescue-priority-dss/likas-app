require('dotenv').config();
const { pool } = require('./index');
const { 
  DISTRICTS, 
  CITIES, 
  BARANGAYS, 
  ACCOUNTS, 
  CREDENTIALS,
  FLOOD_INCIDENTS,
  STREET_VULNERABILITIES,
  STREET_REGISTRY
} = require('../data/baseline');

async function seed() {
  console.log('Starting database seeding...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('DELETE FROM flood_incidents');
    await client.query('DELETE FROM street_vulnerabilities');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM barangays');
    await client.query('DELETE FROM cities');
    await client.query('DELETE FROM districts');
    
    // Seed Districts
    console.log(`Seeding ${DISTRICTS.length} districts...`);
    for (const d of DISTRICTS) {
      await client.query('INSERT INTO districts (id, name) VALUES ($1, $2)', [d.id, d.name]);
    }
    
    // Seed Cities
    console.log(`Seeding ${CITIES.length} cities...`);
    for (const c of CITIES) {
      await client.query('INSERT INTO cities (id, district_id, name) VALUES ($1, $2, $3)', [c.id, c.districtId, c.name]);
    }
    
    // Seed Barangays
    console.log(`Seeding ${BARANGAYS.length} barangays...`);
    for (const b of BARANGAYS) {
      await client.query(
        'INSERT INTO barangays (id, city_id, name, population, lat, lng) VALUES ($1, $2, $3, $4, $5, $6)',
        [b.id, b.cityId, b.name, b.population, b.lat, b.lng]
      );
    }
    
    // Seed Users
    console.log(`Seeding ${ACCOUNTS.length} users...`);
    for (const u of ACCOUNTS) {
      const cred = CREDENTIALS[u.id];
      if (!cred) continue;
      
      await client.query(
        `INSERT INTO users 
         (id, office_name, city_municipality, zone, region, office_contact, office_reference_no, registered_email, role, password_hash) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [u.id, u.officeName, u.cityMunicipality, u.zone || null, u.region, u.officeContact, u.officeReferenceNo, u.registeredEmail, u.role, cred.passwordHash]
      );
    }
    
    // Seed Flood Incidents
    console.log(`Seeding ${FLOOD_INCIDENTS.length} flood records...`);
    for (const f of FLOOD_INCIDENTS) {
      await client.query(
        `INSERT INTO flood_incidents 
         (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [f.id, f.barangayId, f.date, f.time, f.street, f.depthInches, f.status, f.cause, f.priority]
      );
    }
    
    // Seed Street Vulnerabilities
    console.log(`Seeding ${STREET_VULNERABILITIES.length} street vulnerabilities...`);
    for (const s of STREET_VULNERABILITIES) {
      await client.query(
        `INSERT INTO street_vulnerabilities 
         (id, barangay_id, street_name, pwd, elderly, children, pregnant, last_updated) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [s.id, s.barangayId, s.streetName, s.pwd, s.elderly, s.children, s.pregnant, s.lastUpdated]
      );
    }
    
    // Seed Street Registry
    console.log(`Seeding ${STREET_REGISTRY.length} street registry...`);
    for (const s of STREET_REGISTRY) {
      await client.query(
        `INSERT INTO street_registry 
         (id, barangay_id, street_name, priority_score, vulnerability_score, priority, flood_count, last_updated, lat, lng) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [s.id, s.barangayId, s.streetName, s.priorityScore, s.vulnerabilityScore, s.priority, s.floodCount, s.lastUpdated, s.lat, s.lng]
      );
    }
    
    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
