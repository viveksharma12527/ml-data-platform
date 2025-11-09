const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.post('/', roleController.create);
router.get('/', roleController.list);
router.get('/name/:name', roleController.getByName);
router.get('/:id', roleController.get);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.remove);

module.exports = router;