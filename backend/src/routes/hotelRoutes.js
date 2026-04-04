const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

router.get('/', hotelController.getAll);
router.get('/:hotelId', hotelController.getById);
router.post('/', hotelController.create);
router.put('/:hotelId', hotelController.update);
router.delete('/:hotelId', hotelController.remove);
router.get('/:hotelId/rooms', hotelController.getRooms);

module.exports = router;