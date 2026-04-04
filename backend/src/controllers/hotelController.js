const hotelService = require('../services/hotelService');
const { success } = require('../utils/response');

function getAll(req, res, next) {
  try {
    const hotels = hotelService.getAllHotels(req.query);
    return success(res, hotels);
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const hotel = hotelService.getHotelById(req.params.hotelId);
    return success(res, hotel);
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const hotel = hotelService.createHotel(req.body);
    return success(res, hotel, 'Hotel created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const hotel = hotelService.updateHotel(req.params.hotelId, req.body);
    return success(res, hotel, 'Hotel updated successfully');
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    hotelService.deleteHotel(req.params.hotelId);
    return success(res, null, 'Hotel deleted successfully');
  } catch (error) {
    next(error);
  }
}

function getRooms(req, res, next) {
  try {
    const rooms = hotelService.getRoomsForHotel(req.params.hotelId);
    return success(res, rooms);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getRooms,
};