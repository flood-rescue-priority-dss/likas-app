const shapefile = require('shapefile');
const fs = require('fs');
const { Pool } = require('pg');
const csv = require('csv-parser');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const boundariesPath = '../likas-frontend/src/data/boundaries.json';
const csvPath = './raw_data/0629_2025_Flood_Augmented - 0629_2025_Flood_Augmented.csv';
const shapefilePath = './raw_data/gadm_phl/gadm41_PHL_3.shp';
const dbfPath = './raw_data/gadm_phl/gadm41_PHL_3.dbf';

function getDistrict(brgyNum) {
  if (brgyNum >= 1 && brgyNum <= 146) return 'District 1';
  if (brgyNum >= 147 && brgyNum <= 267) return 'District 2';
  if (brgyNum >= 268 && brgyNum <= 394) return 'District 3';
  if (brgyNum >= 395 && brgyNum <= 586) return 'District 4';
  if (brgyNum >= 649 && brgyNum <= 828) return 'District 5';
  if ((brgyNum >= 587 && brgyNum <= 648) || (brgyNum >= 829 && brgyNum <= 905)) return 'District 6';
  return null;
}

function getCenter(geom) {
  try {
    if (geom.type === 'Polygon') return [geom.coordinates[0][0][1], geom.coordinates[0][0][0]]; 
    if (geom.type === 'MultiPolygon') return [geom.coordinates[0][0][0][1], geom.coordinates[0][0][0][0]];
  } catch (e) {}
  return [14.5995, 120.9842];
}

async function run() {
  console.log('--- Wiping all dummy data... ---');
  await pool.query('TRUNCATE TABLE barangays CASCADE');
  console.log('Dummy data cleared successfully!');

  console.log('--- Fetching Districts and Cities ---');
  const { rows: districts } = await pool.query('SELECT id, name FROM districts');
  const { rows: cities } = await pool.query('SELECT id, district_id, name FROM cities');
  
  const newBoundaries = {};
  const barangayIdMap = {}; 
  
  console.log('--- Reading GADM Shapefile for 897 Barangays ---');
  const source = await shapefile.open(shapefilePath, dbfPath);
  let result = await source.read();
  let insertCount = 0;
  
  while (!result.done) {
    const props = result.value.properties;
    const geom = result.value.geometry;
    
    if (props.NAME_2 === 'Manila' && props.NAME_1 === 'Metropolitan Manila') {
      const brgyName = props.NAME_3;
      
      const match = brgyName.match(/(\d+)/);
      let districtName = null;
      if (match) districtName = getDistrict(parseInt(match[1], 10));
      
      if (districtName) {
        const district = districts.find(d => d.name === districtName);
        if (district) {
          const city = cities.find(c => c.district_id === district.id);
          if (city) {
            const center = getCenter(geom);
            const bId = `bgy-${brgyName.replace(/\s+/g, '-').toLowerCase()}`;
            
            await pool.query(
              'INSERT INTO barangays (id, city_id, name, population, lat, lng) VALUES ($1, $2, $3, 0, $4, $5) ON CONFLICT DO NOTHING',
              [bId, city.id, brgyName, center[0], center[1]]
            );
            
            barangayIdMap[brgyName.toLowerCase()] = bId;
            newBoundaries[brgyName] = { type: 'Feature', properties: {}, geometry: geom };
            insertCount++;
          }
        }
      }
    }
    result = await source.read();
  }
  console.log(`Inserted ${insertCount} real barangays to DB.`);

  console.log('--- Processing CSV Dataset ---');
  const records = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => records.push(data))
      .on('end', resolve)
      .on('error', reject);
  });
  console.log(`Found ${records.length} flood records in CSV.`);

  let floodInsertCount = 0;
  let popUpdateCount = 0;

  for (const row of records) {
    const bName = row.barangay ? row.barangay.toLowerCase().trim() : '';
    
    const mappedBgy = Object.keys(barangayIdMap).find(k => k === bName || k === bName.replace('barangay', 'bgy').trim());
    let bgyId = null;
    if (mappedBgy) bgyId = barangayIdMap[mappedBgy];
    
    if (bgyId) {
      if (row.brgy_population_count) {
        await pool.query('UPDATE barangays SET population = $1 WHERE id = $2 AND population = 0', [parseInt(row.brgy_population_count, 10), bgyId]);
        popUpdateCount++;
      }
      
      // Parse date_and_time (e.g. 06/07/2025 06:59)
      let incident_date = new Date().toISOString().split('T')[0];
      let incident_time = '00:00:00';
      
      if (row.date_and_time) {
        const parts = row.date_and_time.split(' ');
        if (parts.length >= 2) {
            // DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD
            const dparts = parts[0].split('/');
            if (dparts.length === 3) {
                // assume MM/DD/YYYY
                incident_date = `${dparts[2]}-${dparts[0].padStart(2, '0')}-${dparts[1].padStart(2, '0')}`;
            }
            incident_time = parts[1];
        }
      }
      
      const priority_score = parseFloat(row.priority_score) || 0;
      let priority = 'Low';
      if (priority_score >= 2.8) priority = 'Very High';
      else if (priority_score >= 2.6) priority = 'High';
      else if (priority_score >= 2.3) priority = 'Medium';
      
      const fId = `fld-${Math.random().toString(36).substring(2,9)}`;
      await pool.query(`
        INSERT INTO flood_incidents 
        (id, barangay_id, incident_date, incident_time, street, depth_inches, status, cause, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        fId, bgyId, incident_date, incident_time, row.location || '', 
        parseFloat(row.flood_depth_in) || 0, row.flood_status || '', 
        row.cause || '', priority
      ]);
      floodInsertCount++;
    }
  }
  
  console.log(`Updated population for ${popUpdateCount} records.`);
  console.log(`Inserted ${floodInsertCount} real flood incidents!`);

  console.log('--- Generating boundaries.json ---');
  const finalBoundaries = {};
  
  for (const bgy of Object.keys(newBoundaries)) {
    finalBoundaries[bgy] = newBoundaries[bgy];
  }
  
  const { rows: finalBarangays } = await pool.query('SELECT name, city_id FROM barangays');
  for (const district of districts) {
    let districtFeatures = [];
    const distCities = cities.filter(c => c.district_id === district.id);
    for (const city of distCities) {
      let cityFeatures = [];
      const cityBrgys = finalBarangays.filter(b => b.city_id === city.id);
      for (const brgy of cityBrgys) {
        if (newBoundaries[brgy.name]) {
          const feature = newBoundaries[brgy.name];
          cityFeatures.push(feature);
          districtFeatures.push(feature);
        }
      }
      if (cityFeatures.length > 0) finalBoundaries[city.name] = { type: 'FeatureCollection', features: cityFeatures };
  }
  
  // Fetch Manila's outer boundary from gadm41_PHL_2.shp
  console.log('--- Reading GADM Shapefile for City Boundaries ---');
  const shp2Path = './raw_data/gadm_phl/gadm41_PHL_2.shp';
  const dbf2Path = './raw_data/gadm_phl/gadm41_PHL_2.dbf';
  try {
    const source2 = await shapefile.open(shp2Path, dbf2Path);
    let result2 = await source2.read();
    while (!result2.done) {
      const props = result2.value.properties;
      if (props.NAME_2 === 'Manila') {
        finalBoundaries['Manila'] = { type: 'Feature', properties: {}, geometry: result2.value.geometry };
        break;
      }
      result2 = await source2.read();
    }
  } catch(e) {
    console.error('Could not load Manila boundary:', e);
  }

  fs.writeFileSync(boundariesPath, JSON.stringify(finalBoundaries));
  console.log(`Saved boundaries.json successfully with ${Object.keys(finalBoundaries).length} total elements (Barangays + Cities + Districts)!`);
  
  await pool.end();
}

run().catch(err => {
  console.error(err);
  pool.end();
});
