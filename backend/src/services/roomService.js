const roomRepository = require('../repositories/roomRepository');
const hotelRepository = require('../repositories/hotelRepository');

function getRoomByCompositeKey(hotelId, roomNumber) {
  const room = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!room) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  return {
    ...room,
    amenities: roomRepository.getAmenities(hotelId, roomNumber),
    hasDamage: !!roomRepository.getActiveProblem(hotelId, roomNumber),
    damageDescription: roomRepository.getActiveProblem(hotelId, roomNumber)?.description || null,
  };
}

function createRoom(data) {
  if (
    !data.hotel_id ||
    !data.room_number ||
    data.base_price === undefined ||
    !data.capacity ||
    !data.view_type ||
    data.extendable === undefined
  ) {
    const error = new Error(
      'hotel_id, room_number, base_price, capacity, view_type, and extendable are required'
    );
    error.status = 400;
    throw error;
  }

  const hotel = hotelRepository.getById(data.hotel_id);
  if (!hotel) {
    const error = new Error('Referenced hotel does not exist');
    error.status = 400;
    throw error;
  }

  if (Number(data.base_price) <= 0) {
    const error = new Error('base_price must be greater than 0');
    error.status = 400;
    throw error;
  }

  const existingRoom = roomRepository.getByCompositeKey(data.hotel_id, data.room_number);
  if (existingRoom) {
    const error = new Error('Room already exists for this hotel');
    error.status = 400;
    throw error;
  }

  return roomRepository.create(data);
}

function updateRoom(hotelId, roomNumber, data) {
  const existingRoom = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!existingRoom) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  if (data.base_price !== undefined && Number(data.base_price) <= 0) {
    const error = new Error('base_price must be greater than 0');
    error.status = 400;
    throw error;
  }

  return roomRepository.update(hotelId, roomNumber, data);
}

function deleteRoom(hotelId, roomNumber) {
  const existingRoom = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!existingRoom) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  roomRepository.remove(hotelId, roomNumber);
}

function searchRooms(filters) {
  const rooms = roomRepository.search(filters);

  return rooms.map((room) => ({
    ...room,
    amenities: roomRepository.getAmenities(room.hotel_id, room.room_number),
    hasDamage: !!roomRepository.getActiveProblem(room.hotel_id, room.room_number),
    damageDescription:
      roomRepository.getActiveProblem(room.hotel_id, room.room_number)?.description || null,
  }));
}

function getAmenities(hotelId, roomNumber) {
  const room = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!room) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  return roomRepository.getAmenities(hotelId, roomNumber);
}

function addAmenity(hotelId, roomNumber, amenity) {
  const room = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!room) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  if (!amenity) {
    const error = new Error('amenity is required');
    error.status = 400;
    throw error;
  }

  const existingAmenities = roomRepository.getAmenities(hotelId, roomNumber);
  if (existingAmenities.includes(amenity)) {
    const error = new Error('Amenity already exists for this room');
    error.status = 400;
    throw error;
  }

  roomRepository.addAmenity(hotelId, roomNumber, amenity);
}

function removeAmenity(hotelId, roomNumber, amenity) {
  const room = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!room) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  const removed = roomRepository.removeAmenity(hotelId, roomNumber, amenity);

  if (!removed) {
    const error = new Error('Amenity not found');
    error.status = 404;
    throw error;
  }
}

function reportProblem(hotelId, roomNumber, description) {
  const room = roomRepository.getByCompositeKey(hotelId, roomNumber);

  if (!room) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  if (!description) {
    const error = new Error('description is required');
    error.status = 400;
    throw error;
  }

  const existingProblem = roomRepository.getActiveProblem(hotelId, roomNumber);
  if (existingProblem) {
    const error = new Error('Room already has an active problem');
    error.status = 400;
    throw error;
  }

  return roomRepository.createProblem(hotelId, roomNumber, description);
}

function resolveProblem(problemId) {
  const problem = roomRepository.resolveProblem(problemId);

  if (!problem) {
    const error = new Error('Problem not found');
    error.status = 404;
    throw error;
  }

  return problem;
}

module.exports = {
  getRoomByCompositeKey,
  createRoom,
  updateRoom,
  deleteRoom,
  searchRooms,
  getAmenities,
  addAmenity,
  removeAmenity,
  reportProblem,
  resolveProblem,
};