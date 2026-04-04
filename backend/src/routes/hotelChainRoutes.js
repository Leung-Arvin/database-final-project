const express = require('express');
const router = express.Router();
const hotelChainController = require('../controllers/hotelChainController');

router.get('/', hotelChainController.getAll);
router.get('/:chainId', hotelChainController.getById);
router.post('/', hotelChainController.create);
router.put('/:chainId', hotelChainController.update);
router.delete('/:chainId', hotelChainController.remove);
router.get('/:chainId/hotels', hotelChainController.getHotels);

module.exports = router;