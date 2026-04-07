const db = require('../db');

function getAll() {
  return db.prepare(`
    SELECT *
    FROM Renting
    WHERE isDeleted = 0
    ORDER BY renting_id
  `).all();
}

function getById(rentingId) {
  return (
    db.prepare(`
      SELECT *
      FROM Renting
      WHERE renting_id = ? AND isDeleted = 0
    `).get(Number(rentingId)) || null
  );
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO Renting (
      customer_id,
      hotel_id,
      room_number,
      employee_id,
      booking_id,
      hotel_name_snapshot,
      hotel_address_snapshot,
      room_number_snapshot,
      check_in_date,
      check_out_date,
      actual_check_in,
      actual_check_out,
      price,
      total_amount,
      payment_method,
      isDeleted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const result = stmt.run(
    Number(data.customer_id),
    Number(data.hotel_id),
    Number(data.room_number),
    Number(data.employee_id),
    data.booking_id === null || data.booking_id === undefined
      ? null
      : Number(data.booking_id),
    data.hotel_name_snapshot,
    data.hotel_address_snapshot,
    Number(data.room_number_snapshot),
    data.check_in_date,
    data.check_out_date,
    data.actual_check_in || null,
    data.actual_check_out || null,
    Number(data.price),
    Number(data.total_amount),
    data.payment_method || null
  );

  return getById(result.lastInsertRowid);
}

function update(rentingId, data) {
  const existing = getById(rentingId);

  if (!existing) return null;

  const updated = {
    actual_check_out:
      data.actual_check_out !== undefined
        ? data.actual_check_out
        : existing.actual_check_out,
    total_amount:
      data.total_amount !== undefined
        ? Number(data.total_amount)
        : existing.total_amount,
    payment_method:
      data.payment_method !== undefined
        ? data.payment_method
        : existing.payment_method,
  };

  db.prepare(`
    UPDATE Renting
    SET
      actual_check_out = ?,
      total_amount = ?,
      payment_method = ?
    WHERE renting_id = ? AND isDeleted = 0
  `).run(
    updated.actual_check_out,
    updated.total_amount,
    updated.payment_method,
    Number(rentingId)
  );

  return getById(rentingId);
}

function softDelete(rentingId) {
  const result = db.prepare(`
    UPDATE Renting
    SET isDeleted = 1
    WHERE renting_id = ? AND isDeleted = 0
  `).run(Number(rentingId));

  if (result.changes === 0) return null;

  return db.prepare(`
    SELECT *
    FROM Renting
    WHERE renting_id = ?
  `).get(Number(rentingId)) || null;
}

function findActiveOverlap(hotelId, roomNumber, startDate, endDate) {
  return db.prepare(`
    SELECT *
    FROM Renting
    WHERE isDeleted = 0
      AND hotel_id = ?
      AND room_number = ?
      AND check_in_date < ?
      AND check_out_date > ?
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
  update,
  softDelete,
  findActiveOverlap,
};