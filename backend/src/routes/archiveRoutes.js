const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');

router.get('/bookings', archiveController.getAllArchivedBookings);
router.get('/bookings/:archiveId', archiveController.getArchivedBookingById);
router.post('/bookings/:bookingId', archiveController.archiveBooking);

router.get('/rentings', archiveController.getAllArchivedRentings);
router.get('/rentings/:archiveId', archiveController.getArchivedRentingById);
router.post('/rentings/:rentingId', archiveController.archiveRenting);

module.exports = router;