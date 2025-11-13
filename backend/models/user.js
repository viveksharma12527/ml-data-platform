const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async create(username, password, email, roleId, firstname, lastname) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =`
    INSERT INTO users (username, password, email, role_id, first_name, last_name)
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *;
    `;
    const values = [username, hashedPassword, email, roleId, firstname, lastname];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },
};

module.exports = User;