const express = require('express');
const router = express.Router();

const authenticatToken = require('../Middlewares/auth');

const projectManagementController = require('./projectManagement.controller');

router.use(authenticatToken);

router.get('/projects', projectManagementController.getAnnotatorProjects);
router.get('/projects/:projectId', projectManagementController.getProjectById);

module.exports = router;