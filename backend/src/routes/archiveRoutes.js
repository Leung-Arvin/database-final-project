const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');

router.get('/bookings', archiveController.getAllArchivedBookings);
router.get('/bookings/:archiveId', archiveController.getArchivedBookingById);

router.get('/rentings', archiveController.getAllArchivedRentings);
router.get('/rentings/:archiveId', archiveController.getArchivedRentingById);

module.exports = router;