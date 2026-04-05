const {
  hotels,
  rooms,
  roomProblems,
} = require('../data/mockData');

function getAvailableRoomsPerArea() {
  const areaMap = new Map();

  for (const hotel of hotels) {
    const area = hotel.area;

    if (!areaMap.has(area)) {
      areaMap.set(area, {
        area,
        total_rooms: 0,
        available_rooms: 0,
      });
    }

    const hotelRooms = rooms.filter((room) => room.hotel_id === hotel.hotel_id);

    for (const room of hotelRooms) {
      const areaData = areaMap.get(area);
      areaData.total_rooms += 1;

      const activeProblem = roomProblems.find(
        (problem) =>
          problem.hotel_id === room.hotel_id &&
          problem.room_number === room.room_number &&
          problem.resolved_date === null
      );

      if (!activeProblem) {
        areaData.available_rooms += 1;
      }
    }
  }

  return Array.from(areaMap.values());
}

function getRoomCapacityByHotel() {
  return hotels.map((hotel) => {
    const hotelRooms = rooms.filter((room) => room.hotel_id === hotel.hotel_id);

    const capacity_breakdown = {
      single: 0,
      double: 0,
      triple: 0,
      quad: 0,
    };

    let total_capacity = 0;

    for (const room of hotelRooms) {
      if (capacity_breakdown[room.capacity] !== undefined) {
        capacity_breakdown[room.capacity] += 1;
      }

      if (room.capacity === 'single') total_capacity += 1;
      if (room.capacity === 'double') total_capacity += 2;
      if (room.capacity === 'triple') total_capacity += 3;
      if (room.capacity === 'quad') total_capacity += 4;
    }

    return {
      hotel_id: hotel.hotel_id,
      hotel_name: `${hotel.chain_name} - ${hotel.area}`,
      total_rooms: hotelRooms.length,
      total_capacity,
      capacity_breakdown,
    };
  });
}

function getRoomCapacityByHotelId(hotelId) {
  const hotel = hotels.find((item) => item.hotel_id === Number(hotelId));
  if (!hotel) return null;

  const hotelRooms = rooms.filter((room) => room.hotel_id === hotel.hotel_id);

  const capacity_breakdown = {
    single: 0,
    double: 0,
    triple: 0,
    quad: 0,
  };

  let total_capacity = 0;

  for (const room of hotelRooms) {
    if (capacity_breakdown[room.capacity] !== undefined) {
      capacity_breakdown[room.capacity] += 1;
    }

    if (room.capacity === 'single') total_capacity += 1;
    if (room.capacity === 'double') total_capacity += 2;
    if (room.capacity === 'triple') total_capacity += 3;
    if (room.capacity === 'quad') total_capacity += 4;
  }

  return {
    hotel_id: hotel.hotel_id,
    hotel_name: `${hotel.chain_name} - ${hotel.area}`,
    total_rooms: hotelRooms.length,
    total_capacity,
    capacity_breakdown,
  };
}

module.exports = {
  getAvailableRoomsPerArea,
  getRoomCapacityByHotel,
  getRoomCapacityByHotelId,
};