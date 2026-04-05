const express = require('express');
const router = express.Router();

const hotelChainRoutes = require('./hotelChainRoutes');
const hotelRoutes = require('./hotelRoutes');
const roomRoutes = require('./roomRoutes');
const bookingRoutes = require('./bookingRoutes');
const rentingRoutes = require('./rentingRoutes');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    data: 'API is working',
  });
});

router.use('/hotel-chains', hotelChainRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/rentings', rentingRoutes);

module.exports = router;