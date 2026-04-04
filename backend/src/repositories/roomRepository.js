const { rooms, roomAmenities, roomProblems, hotels } = require('../data/mockData');

function getAll() {
  return rooms;
}

function getByHotelId(hotelId) {
  return rooms.filter((room) => room.hotel_id === Number(hotelId));
}

function getByCompositeKey(hotelId, roomNumber) {
  return (
    rooms.find(
      (room) =>
        room.hotel_id === Number(hotelId) &&
        room.room_number === String(roomNumber)
    ) || null
  );
}

function create(data) {
  const newRoom = {
    hotel_id: Number(data.hotel_id),
    room_number: String(data.room_number),
    base_price: Number(data.base_price),
    capacity: data.capacity,
    view_type: data.view_type,
    extendable: Boolean(data.extendable),
  };

  rooms.push(newRoom);
  return newRoom;
}

function update(hotelId, roomNumber, data) {
  const index = rooms.findIndex(
    (room) =>
      room.hotel_id === Number(hotelId) &&
      room.room_number === String(roomNumber)
  );

  if (index === -1) return null;

  rooms[index] = {
    ...rooms[index],
    ...data,
    hotel_id: rooms[index].hotel_id,
    room_number: rooms[index].room_number,
    base_price:
      data.base_price !== undefined
        ? Number(data.base_price)
        : rooms[index].base_price,
    extendable:
      data.extendable !== undefined
        ? Boolean(data.extendable)
        : rooms[index].extendable,
  };

  return rooms[index];
}

function remove(hotelId, roomNumber) {
  const index = rooms.findIndex(
    (room) =>
      room.hotel_id === Number(hotelId) &&
      room.room_number === String(roomNumber)
  );

  if (index === -1) return false;

  rooms.splice(index, 1);
  return true;
}

function getAmenities(hotelId, roomNumber) {
  return roomAmenities
    .filter(
      (item) =>
        item.hotel_id === Number(hotelId) &&
        item.room_number === String(roomNumber)
    )
    .map((item) => item.amenity);
}

function addAmenity(hotelId, roomNumber, amenity) {
  roomAmenities.push({
    hotel_id: Number(hotelId),
    room_number: String(roomNumber),
    amenity,
  });
}

function removeAmenity(hotelId, roomNumber, amenity) {
  const index = roomAmenities.findIndex(
    (item) =>
      item.hotel_id === Number(hotelId) &&
      item.room_number === String(roomNumber) &&
      item.amenity === amenity
  );

  if (index === -1) return false;

  roomAmenities.splice(index, 1);
  return true;
}

function getActiveProblem(hotelId, roomNumber) {
  return (
    roomProblems.find(
      (problem) =>
        problem.hotel_id === Number(hotelId) &&
        problem.room_number === String(roomNumber) &&
        problem.resolved_date === null
    ) || null
  );
}

function createProblem(hotelId, roomNumber, description) {
  const newProblem = {
    problem_id: roomProblems.length > 0
      ? Math.max(...roomProblems.map((p) => p.problem_id)) + 1
      : 1,
    hotel_id: Number(hotelId),
    room_number: String(roomNumber),
    description,
    reported_date: new Date().toISOString().split('T')[0],
    resolved_date: null,
  };

  roomProblems.push(newProblem);
  return newProblem;
}

function resolveProblem(problemId) {
  const problem = roomProblems.find(
    (item) => item.problem_id === Number(problemId)
  );

  if (!problem) return null;

  problem.resolved_date = new Date().toISOString().split('T')[0];
  return problem;
}

function search(filters = {}) {
  let results = [...rooms];

  if (filters.hotel_id) {
    results = results.filter((room) => room.hotel_id === Number(filters.hotel_id));
  }

  if (filters.capacity) {
    results = results.filter((room) => room.capacity === filters.capacity);
  }

  if (filters.min_price !== undefined) {
    results = results.filter((room) => room.base_price >= Number(filters.min_price));
  }

  if (filters.max_price !== undefined) {
    results = results.filter((room) => room.base_price <= Number(filters.max_price));
  }

  if (filters.area || filters.hotel_chain_id || filters.rating) {
    results = results.filter((room) => {
      const hotel = hotels.find((h) => h.hotel_id === room.hotel_id);
      if (!hotel) return false;

      if (filters.area && !hotel.area.toLowerCase().includes(String(filters.area).toLowerCase())) {
        return false;
      }

      if (filters.hotel_chain_id && hotel.chain_id !== Number(filters.hotel_chain_id)) {
        return false;
      }

      if (filters.rating && hotel.rating !== Number(filters.rating)) {
        return false;
      }

      return true;
    });
  }

  return results;
}

module.exports = {
  getAll,
  getByHotelId,
  getByCompositeKey,
  create,
  update,
  remove,
  getAmenities,
  addAmenity,
  removeAmenity,
  getActiveProblem,
  createProblem,
  resolveProblem,
  search,
};