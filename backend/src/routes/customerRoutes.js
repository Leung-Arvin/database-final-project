const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAll);
router.get('/:customerId', customerController.getById);
router.post('/', customerController.create);
router.put('/:customerId', customerController.update);
router.delete('/:customerId', customerController.delete);
router.get('/:customerId/bookings', customerController.getBookings);

module.exports = router;