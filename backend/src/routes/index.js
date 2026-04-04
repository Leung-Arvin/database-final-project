const express = require('express');
const router = express.Router();

const hotelChainRoutes = require('./hotelChainRoutes');
const hotelRoutes = require('./hotelRoutes');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    data: 'API is working',
  });
});

router.use('/hotel-chains', hotelChainRoutes);
router.use('/hotels', hotelRoutes);

module.exports = router;