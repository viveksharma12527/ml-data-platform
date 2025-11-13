const express = require('express');
const router = express.Router();
const authenticatToken = require('../Middlewares/auth');
const authorize = require('../Middlewares/authorize');


const labelTypeController = require('./labelTypeManagement.controller');

// All routes require authentication and authorization (role based access - for Data specialist id 2)
router.use(authenticatToken, authorize([2]));

// Label Type Management
router.get('/', labelTypeController.listAllLabelTypes);
router.get('/:id', labelTypeController.getLabelTypeDetails);
router.post('/', labelTypeController.createLabelType);
router.patch('/:id', labelTypeController.updateLabelType);
router.delete('/', labelTypeController.deleteLabelTypes);

// Label Class Management
router.get('/:id/classes', labelTypeController.getLabelTypeClasses);
router.post('/:id/classes', labelTypeController.addClassToLabelType);
router.delete('/:id/classes/:classId', labelTypeController.removeClassFromLabelType);

module.exports = router;