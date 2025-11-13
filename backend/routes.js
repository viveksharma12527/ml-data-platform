const express = require('express');
const router = express.Router();

// importing components routes
const authRoutes = require('./routes/auth');
const projectManagementRoutes = require('./ProjectManagement/projectManagement.routes');
const annotationToolRoutes = require('./AnnotationTool/annotation.routes');
const labelTypesManagementRoutes = require('./LabelTypeManagement/labelTypeManagement.routes');


router.use('/auth', authRoutes);
router.use('/projects', projectManagementRoutes);
router.use('/annotation', annotationToolRoutes);
router.use('/label-types', labelTypesManagementRoutes);

module.exports = router;