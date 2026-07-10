const { Pool } = require('pg');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const csvPath = './raw_data/0629_2025_Flood_Augmented - 0629_2025_Flood_Augmented.csv';

async function run() {
  console.log('--- Fetching existing barangays ---');
  const { rows: barangays } = await pool.query('SELECT id, name FROM barangays');
  const barangayIdMap = {};
  for (const b of barangays) {
    barangayIdMap[b.name.toLowerCase()] = b.id;
  }

  console.log('--- Processing CSV for Street Registry ---');
  const records = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => records.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  // Group by Street Name (location) per barangay
  const registryMap = {};
  
  for (const row of records) {
    const bName = row.barangay ? row.barangay.toLowerCase().trim() : '';
    const mappedBgy = Object.keys(barangayIdMap).find(k => k === bName || k === bName.replace('barangay', 'bgy').trim());
    let bgyId = null;
    if (mappedBgy) bgyId = barangayIdMap[mappedBgy];
    
    if (bgyId && row.location) {
      const key = `${bgyId}_${row.location}`;
      if (!registryMap[key]) {
        let priority = 'Low';
        const pScore = parseFloat(row.priority_score) || 0;
        if (pScore >= 2.8) priority = 'Very High';
        else if (pScore >= 2.6) priority = 'High';
        else if (pScore >= 2.3) priority = 'Medium';
        
        registryMap[key] = {
          bgyId: bgyId,
          street_name: row.location,
          priority_score: pScore,
          vulnerability_score: parseFloat(row.vulnerability_score) || 0,
          priority: priority,
          flood_count: 1,
          lat: parseFloat(row.y) || 0,
          lng: parseFloat(row.x) || 0,
          pwd: parseInt(row.brgy_pwd_count) || 0,
          elderly: parseInt(row.brgy_senior_count) || 0,
          children: parseInt(row.brgy_children_count) || 0,
          pregnant: parseInt(row.brgy_pregnant_count) || 0
        };
      } else {
        registryMap[key].flood_count += 1;
      }
    }
  }

  console.log(`Found ${Object.keys(registryMap).length} unique streets.`);
  let countReg = 0;
  let countVuln = 0;

  for (const key in registryMap) {
    const data = registryMap[key];
    const rId = `reg-${Math.random().toString(36).substring(2,9)}`;
    const vId = `vuln-${Math.random().toString(36).substring(2,9)}`;
    
    // Insert into street_registry
    await pool.query(`
      INSERT INTO street_registry 
      (id, barangay_id, street_name, priority_score, vulnerability_score, priority, flood_count, last_updated, lat, lng)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8, $9)
    `, [rId, data.bgyId, data.street_name, data.priority_score, data.vulnerability_score, data.priority, data.flood_count, data.lat, data.lng]);
    countReg++;

    // Insert into street_vulnerabilities
    await pool.query(`
      INSERT INTO street_vulnerabilities
      (id, barangay_id, street_name, pwd, elderly, children, pregnant, last_updated)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
    `, [vId, data.bgyId, data.street_name, data.pwd, data.elderly, data.children, data.pregnant]);
    countVuln++;
  }

  console.log(`Inserted ${countReg} street registry records.`);
  console.log(`Inserted ${countVuln} street vulnerability records.`);
  await pool.end();
}

run().catch(err => {
  console.error(err);
  pool.end();
});
