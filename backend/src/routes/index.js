const express = require('express');
const router = express.Router();

const hotelChainRoutes = require('./hotelChainRoutes');
const hotelRoutes = require('./hotelRoutes');
const roomRoutes = require('./roomRoutes');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    data: 'API is working',
  });
});

router.use('/hotel-chains', hotelChainRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;