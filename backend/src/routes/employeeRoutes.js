const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAll);
router.get('/:employeeId', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:employeeId', employeeController.update);
router.delete('/:employeeId', employeeController.delete);

module.exports = router;