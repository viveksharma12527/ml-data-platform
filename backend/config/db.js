const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'ml_platform_user',
  host: 'localhost',
  database: 'ml_platform_db',
  password: '',
  port: 5432,
});

module.exports = pool;