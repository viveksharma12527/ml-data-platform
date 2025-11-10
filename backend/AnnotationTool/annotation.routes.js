const express = require('express');
const router = express.Router();
const annotationController = require('./annotation.controller.js');
const authenticatToken = require('../Middlewares/auth.js');

router.use(authenticatToken);

router.post('/', annotationController.saveAnnotation);
router.get('/next', annotationController.getNextImage);

module.exports = router;