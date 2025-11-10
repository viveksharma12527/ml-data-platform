const express = require('express');
const router = express.Router();

// importing components routes
const authRoutes = require('./routes/auth');
const projectManagementRoutes = require('./ProjectManagement/projectManagement.routes');
const annotationToolRoutes = require('./AnnotationTool/annotation.routes');


router.use('/auth', authRoutes);
router.use('/projectManagement', projectManagementRoutes);
router.use('/annotation', annotationToolRoutes);

module.exports = router;