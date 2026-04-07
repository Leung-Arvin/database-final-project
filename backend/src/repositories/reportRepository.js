const db = require('../db');

function getAvailableRoomsPerArea() {
  return db.prepare(`
    SELECT area, available_rooms
    FROM AvailableRoomsPerArea
    ORDER BY area
  `).all();
}

function getRoomCapacityByHotel() {
  return db.prepare(`
    SELECT
      hotel_id,
      chain_name,
      area,
      address,
      total_rooms,
      total_capacity
    FROM RoomCapacityByHotel
    ORDER BY hotel_id
  `).all();
}

function getRoomCapacityByHotelId(hotelId) {
  return db.prepare(`
    SELECT
      hotel_id,
      chain_name,
      area,
      address,
      total_rooms,
      total_capacity
    FROM RoomCapacityByHotel
    WHERE hotel_id = ?
  `).get(Number(hotelId)) || null;
}

module.exports = {
  getAvailableRoomsPerArea,
  getRoomCapacityByHotel,
  getRoomCapacityByHotelId,
};