const { Pool } = require('pg'); 
const pool = new Pool({ connectionString: 'postgresql://postgres.ryytchmgqlbupuaahmzh:qhcbels12345!@13.213.241.248:6543/postgres' }); 
pool.query("UPDATE users SET archived_at = NOW() WHERE status = 'Archived'")
  .then(() => { console.log('Updated existing archived_at'); pool.end(); })
  .catch(e => { console.log(e.message); pool.end(); });
