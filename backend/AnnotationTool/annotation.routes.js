const express = require('express');
const router = express.Router();
const annotationController = require('./annotation.controller.js');
const authenticatToken = require('../Middlewares/auth.js');


// all routes requrie authentication 
router.use(authenticatToken);

// Annotation Management
router.post('/', annotationController.createAnnotation);
router.get('/project/:projectId', annotationController.getAnnotations);
router.get('/:id', annotationController.getAnnotationById);
router.delete('/:id', annotationController.deleteAnnotation);

// Statistics
router.get('/project/:projectId/stats', annotationController.getAnnotationStats);

module.exports = router;