const db = require('../db');

function getAll(filters = {}) {
  let query = `
    SELECT *
    FROM Booking
    WHERE isDeleted = 0
  `;
  const params = [];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.hotel_id) {
    query += ' AND hotel_id = ?';
    params.push(Number(filters.hotel_id));
  }

  if (filters.customer_id) {
    query += ' AND customer_id = ?';
    params.push(Number(filters.customer_id));
  }

  query += ' ORDER BY booking_id';

  return db.prepare(query).all(...params);
}

function getById(bookingId) {
  return (
    db.prepare(`
      SELECT *
      FROM Booking
      WHERE booking_id = ? AND isDeleted = 0
    `).get(Number(bookingId)) || null
  );
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO Booking (
      customer_id,
      hotel_id,
      room_number,
      hotel_name_snapshot,
      hotel_address_snapshot,
      room_number_snapshot,
      start_date,
      end_date,
      booking_price,
      status,
      isDeleted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const result = stmt.run(
    Number(data.customer_id),
    Number(data.hotel_id),
    Number(data.room_number),
    data.hotel_name_snapshot,
    data.hotel_address_snapshot,
    Number(data.room_number_snapshot),
    data.start_date,
    data.end_date,
    Number(data.booking_price),
    data.status || 'active'
  );

  return getById(result.lastInsertRowid);
}

function updateStatus(bookingId, status) {
  const result = db.prepare(`
    UPDATE Booking
    SET status = ?
    WHERE booking_id = ? AND isDeleted = 0
  `).run(status, Number(bookingId));

  if (result.changes === 0) return null;

  return getById(bookingId);
}

function softDelete(bookingId) {
  const result = db.prepare(`
    UPDATE Booking
    SET isDeleted = 1
    WHERE booking_id = ? AND isDeleted = 0
  `).run(Number(bookingId));

  if (result.changes === 0) return null;

  return db.prepare(`
    SELECT *
    FROM Booking
    WHERE booking_id = ?
  `).get(Number(bookingId)) || null;
}

function findOverlappingBookings(hotelId, roomNumber, startDate, endDate) {
  return db.prepare(`
    SELECT *
    FROM Booking
    WHERE isDeleted = 0
      AND hotel_id = ?
      AND room_number = ?
      AND status != 'cancelled'
      AND start_date < ?
      AND end_date > ?
  `).all(
    Number(hotelId),
    Number(roomNumber),
    endDate,
    startDate
  );
}

module.exports = {
  getAll,
  getById,
  create,
  updateStatus,
  softDelete,
  findOverlappingBookings,
};