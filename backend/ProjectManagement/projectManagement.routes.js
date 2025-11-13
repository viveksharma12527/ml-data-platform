const express = require('express');
const router = express.Router();

const authenticatToken = require('../Middlewares/auth');
const authorize = require('../Middlewares/authorize');

const projectManagementController = require('./projectManagement.controller');

// All routes require authentication
router.use(authenticatToken);

// Project Management
router.get('/', projectManagementController.getProjects);
router.get('/available-annotators', authorize([2]), projectManagementController.getAvailableAnnotators); // Will return empty array because it's not implemented yet - will be ready with it's component-
router.get('/available-images', authorize([2]), projectManagementController.getAvailableImages);// Will return empty array because it's not implemented yet - will be ready with it's component-
router.get('/:id', projectManagementController.getProjectDetails);
router.post('/', authorize([2]), projectManagementController.createProject); 
router.patch('/:id', authorize([2]), projectManagementController.updateProject);
router.delete('/:id', authorize([2]), projectManagementController.deleteProject);

// Project Relationships
router.post('/:id/assign-annotators', authorize([2]), projectManagementController.assignAnnotators);
router.post('/:id/add-images', authorize([2]), projectManagementController.addImagesToProject);
router.delete('/:id/remove-images', authorize([2]), projectManagementController.removeImagesFromProject);

module.exports = router;