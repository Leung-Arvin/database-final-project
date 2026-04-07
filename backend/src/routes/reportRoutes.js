const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/available-rooms-per-area', reportController.getAvailableRoomsPerArea);
router.get('/room-capacity-by-hotel', reportController.getRoomCapacityByHotel);
router.get('/room-capacity-by-hotel/:hotelId', reportController.getRoomCapacityByHotelId);
router.get('/hotels-above-average-capacity', reportController.getHotelsAboveAverageCapacity);

module.exports = router;