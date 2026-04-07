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

function getHotelsAboveAverageCapacity() {
  return db.prepare(`
    SELECT
      h.hotel_id,
      hc.chain_name,
      h.area,
      SUM(r.capacity) AS total_capacity
    FROM Hotel h
    JOIN HotelChain hc
      ON hc.chain_id = h.chain_id
    JOIN Room r
      ON r.hotel_id = h.hotel_id
    GROUP BY h.hotel_id, hc.chain_name, h.area
    HAVING SUM(r.capacity) > (
      SELECT AVG(hotel_capacity)
      FROM (
        SELECT SUM(r2.capacity) AS hotel_capacity
        FROM Room r2
        GROUP BY r2.hotel_id
      )
    )
    ORDER BY total_capacity DESC
  `).all();
}

module.exports = {
  getAvailableRoomsPerArea,
  getRoomCapacityByHotel,
  getRoomCapacityByHotelId,
  getHotelsAboveAverageCapacity,
};