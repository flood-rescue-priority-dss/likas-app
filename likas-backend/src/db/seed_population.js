require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const csvData = fs.readFileSync('../Manila_Barangays_Population_Merged.csv', 'utf8').trim().split('\n');
  const headers = csvData[0];
  
  let updatedCount = 0;
  
  console.log('Connecting to DB and starting population update...');
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i].trim();
    if (!row) continue;
    
    // Barangay Name,Area,District,Population,PWD,Elderly,Children,Pregnant
    const cols = row.split(',');
    const bName = cols[0];
    const population = parseInt(cols[3]) || 0;
    const pwd = parseInt(cols[4]) || 0;
    const elderly = parseInt(cols[5]) || 0;
    const children = parseInt(cols[6]) || 0;
    const pregnant = parseInt(cols[7]) || 0;
    
    try {
      const res = await pool.query(
        `UPDATE barangays SET 
         population = $1, 
         pwd = $2, 
         elderly = $3, 
         children = $4, 
         pregnant = $5
         WHERE name = $6`,
        [population, pwd, elderly, children, pregnant, bName]
      );
      if (res.rowCount > 0) {
        updatedCount++;
      }
    } catch (e) {
      console.error('Error updating ' + bName, e);
    }
  }
  
  console.log(`Finished updating ${updatedCount} barangays.`);
  await pool.end();
}

main().catch(console.error);
