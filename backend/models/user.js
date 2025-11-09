const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async create(username, password, email, roleId) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, hashedPassword, email, roleId]
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },
};

module.exports = User;