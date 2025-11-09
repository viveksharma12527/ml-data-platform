const pool = require('../config/db');

const Roles = {
    // Create a new role
    async create(name) {
        const result = await pool.query(
            'INSERT INTO roles (name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    },

    // Get all roles ordered by ID
    async findAll() {
        const result = await pool.query('SELECT * FROM roles ORDER BY id');
        return result.rows;
    },

    // Find a role by its ID
    async findById(id) {
        const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Find a role by its name
    async findByName(name) {
        const result = await pool.query('SELECT * FROM roles WHERE name = $1', [name]);
        return result.rows[0];
    },

    // Update a role's name by ID
    async update(id, name) {
        const result = await pool.query(
            'UPDATE roles SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0];
    },

    // Delete a role by ID
    async delete(id) {
        await pool.query('DELETE FROM roles WHERE id = $1', [id]);
        return { message: `Role with id ${id} deleted` };
    },
};

module.exports = Roles;