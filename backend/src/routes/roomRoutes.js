const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/search', roomController.search);
router.get('/:hotelId/:roomNumber', roomController.getByCompositeKey);
router.post('/', roomController.create);
router.put('/:hotelId/:roomNumber', roomController.update);
router.delete('/:hotelId/:roomNumber', roomController.remove);

router.get('/:hotelId/:roomNumber/amenities', roomController.getAmenities);
router.post('/:hotelId/:roomNumber/amenities', roomController.addAmenity);
router.delete('/:hotelId/:roomNumber/amenities/:amenity', roomController.removeAmenity);

router.post('/:hotelId/:roomNumber/problems', roomController.reportProblem);
router.put('/problems/:problemId/resolve', roomController.resolveProblem);

module.exports = router;