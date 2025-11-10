const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/auth');
const projectManagementRoutes = require('./ProjectManagement/projectManagement.routes');

router.use('/auth', authRoutes);
router.use('/projectManagement', projectManagementRoutes);

module.exports = router;