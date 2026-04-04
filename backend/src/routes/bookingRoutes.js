const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAll);
router.get('/:bookingId', bookingController.getById);
router.post('/', bookingController.create);
router.patch('/:bookingId/status', bookingController.updateStatus);
router.post('/:bookingId/cancel', bookingController.cancel);
router.post('/:bookingId/confirm', bookingController.confirm);

module.exports = router;