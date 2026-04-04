const roomService = require('../services/roomService');
const { success } = require('../utils/response');

function search(req, res, next) {
  try {
    const rooms = roomService.searchRooms(req.body);
    return success(res, rooms);
  } catch (error) {
    next(error);
  }
}

function getByCompositeKey(req, res, next) {
  try {
    const room = roomService.getRoomByCompositeKey(
      req.params.hotelId,
      req.params.roomNumber
    );
    return success(res, room);
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const room = roomService.createRoom(req.body);
    return success(res, room, 'Room created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const room = roomService.updateRoom(
      req.params.hotelId,
      req.params.roomNumber,
      req.body
    );
    return success(res, room, 'Room updated successfully');
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    roomService.deleteRoom(req.params.hotelId, req.params.roomNumber);
    return success(res, null, 'Room deleted successfully');
  } catch (error) {
    next(error);
  }
}

function getAmenities(req, res, next) {
  try {
    const amenities = roomService.getAmenities(
      req.params.hotelId,
      req.params.roomNumber
    );
    return success(res, amenities);
  } catch (error) {
    next(error);
  }
}

function addAmenity(req, res, next) {
  try {
    roomService.addAmenity(
      req.params.hotelId,
      req.params.roomNumber,
      req.body.amenity
    );
    return success(res, null, 'Amenity added successfully', 201);
  } catch (error) {
    next(error);
  }
}

function removeAmenity(req, res, next) {
  try {
    roomService.removeAmenity(
      req.params.hotelId,
      req.params.roomNumber,
      req.params.amenity
    );
    return success(res, null, 'Amenity removed successfully');
  } catch (error) {
    next(error);
  }
}

function reportProblem(req, res, next) {
  try {
    const problem = roomService.reportProblem(
      req.params.hotelId,
      req.params.roomNumber,
      req.body.description
    );
    return success(res, problem, 'Problem reported successfully', 201);
  } catch (error) {
    next(error);
  }
}

function resolveProblem(req, res, next) {
  try {
    const problem = roomService.resolveProblem(req.params.problemId);
    return success(res, problem, 'Problem resolved successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  search,
  getByCompositeKey,
  create,
  update,
  remove,
  getAmenities,
  addAmenity,
  removeAmenity,
  reportProblem,
  resolveProblem,
};