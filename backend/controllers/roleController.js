const Role = require('../models/roles');

module.exports = {
    // POST /roles
    async create(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: 'name is required' });
            const exists = await Role.findByName(name);
            if (exists) return res.status(409).json({ message: 'role already exists' });
            const role = await Role.create(name);
            return res.status(201).json(role);
        } catch (err) {
            // unique violation fallback
            if (err.code === '23505') return res.status(409).json({ message: 'role already exists' });
            console.error('ROLE CREATE ERROR:', err);
            return res.status(500).json({ message: 'internal error' });
        }
    },

    // GET /roles
    async list(_req, res) {
        const roles = await Role.findAll();
        return res.json(roles);
    },

    //GET /name/:name
    async getByName(req, res) {
        const { name } = req.params;
        const role = await Role.findByName(name);
        if (!role) return res.status(404).json({ message: `Role '${name}' not found` });
        return res.json(role);
    },

    // GET /roles/:id
    async get(req, res) {
        const role = await Role.findById(Number(req.params.id));
        if (!role) return res.status(404).json({ message: 'not found' });
        return res.json(role);
    },

    // PUT /roles/:id
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: 'name is required' });
            const updated = await Role.update(id, name);
            if (!updated) return res.status(404).json({ message: 'not found' });
            return res.json(updated);
        } catch (err) {
            if (err.code === '23505') return res.status(409).json({ message: 'role already exists' });
            console.error('ROLE UPDATE ERROR:', err);
            return res.status(500).json({ message: 'internal error' });
        }
    },

    // DELETE /roles/:id
    async remove(req, res) {
        const id = Number(req.params.id);
        const existing = await Role.findById(id);
        if (!existing) return res.status(404).json({ message: 'not found' });
        await Role.delete(id);
        return res.json({ message: 'deleted' });
    },
};