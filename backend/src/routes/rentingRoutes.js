const express = require('express');
const router = express.Router();
const rentingController = require('../controllers/rentingController');

router.get('/', rentingController.getAll);
router.get('/:rentingId', rentingController.getById);
router.post('/check-in', rentingController.checkIn);
router.post('/direct', rentingController.directRent);
router.post('/:rentingId/check-out', rentingController.checkOut);

module.exports = router;