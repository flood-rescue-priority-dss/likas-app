const fs = require('fs');
const bcrypt = require('bcryptjs');
const baseline = require('./src/data/baseline.js');

const defaultPassword = 'Password123!';
const defaultHash = bcrypt.hashSync(defaultPassword, 10);
const adminPassword = 'Mdrrmo2026!';
const adminHash = bcrypt.hashSync(adminPassword, 10);

const ACCOUNTS = [];
const CREDENTIALS = {};

// Add Admin
ACCOUNTS.push({
  id: 'mdrrmo-manila',
  officeName: 'Manila MDRRMO',
  cityMunicipality: 'Manila City',
  region: 'NCR',
  officeContact: '+63 930 434 8364',
  officeReferenceNo: 'NCR-MDRRMO-0001',
  registeredEmail: 'manila.mdrrmo@gov.ph',
  role: 'admin',
  lastLogin: '2026-06-09T18:21:00',
  passwordHash: adminHash
});
CREDENTIALS['manila.mdrrmo@gov.ph'] = { password: adminPassword, accountId: 'mdrrmo-manila' };

// Generate accounts for all barangays
baseline.BARANGAYS.forEach(brgy => {
  const email = `manila.${brgy.id}@gov.ph`;
  ACCOUNTS.push({
    id: brgy.id,
    officeName: brgy.name,
    cityMunicipality: 'Manila City',
    zone: 'N/A',
    officeContact: 'N/A',
    officeReferenceNo: `MLA-${brgy.id.toUpperCase()}`,
    registeredEmail: email,
    role: 'barangay',
    lastLogin: null,
    passwordHash: defaultHash
  });
  CREDENTIALS[email] = { password: defaultPassword, accountId: brgy.id };
});

const idx651 = ACCOUNTS.findIndex(a => a.id === 'brgy-651');
if (idx651 !== -1) {
    ACCOUNTS[idx651].passwordHash = bcrypt.hashSync('Brgy651!', 10);
    CREDENTIALS['manila.brgy.651@gov.ph'] = { password: 'Brgy651!', accountId: 'brgy-651' };
} else {
    ACCOUNTS.push({
      id: 'brgy-651',
      officeName: 'Barangay 651',
      cityMunicipality: 'Manila City',
      zone: '68',
      officeContact: '+63 930 434 8364',
      officeReferenceNo: 'MLA-BRGY-0676',
      registeredEmail: 'manila.brgy.651@gov.ph',
      role: 'barangay',
      lastLogin: '2026-06-09T18:21:00',
      passwordHash: bcrypt.hashSync('Brgy651!', 10)
    });
    CREDENTIALS['manila.brgy.651@gov.ph'] = { password: 'Brgy651!', accountId: 'brgy-651' };
}

let fileContent = fs.readFileSync('src/data/baseline.js', 'utf8');

// The regex needs to replace the whole ACCOUNTS array
fileContent = fileContent.replace(/const ACCOUNTS = \[[\s\S]*?\];/m, `const ACCOUNTS = ${JSON.stringify(ACCOUNTS, null, 2)};`);
fileContent = fileContent.replace(/const CREDENTIALS = \{[\s\S]*?\};/m, `const CREDENTIALS = ${JSON.stringify(CREDENTIALS, null, 2)};`);

fs.writeFileSync('src/data/baseline.js', fileContent);
console.log('Successfully updated accounts in baseline.js');
