const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, '../data/hotel-database.db'));

function getAll() {
  return db.prepare(`
    SELECT *
    FROM Customer
    ORDER BY customer_id
  `).all();
}

function getById(customerId) {
  return db.prepare(`
    SELECT *
    FROM Customer
    WHERE customer_id = ?
  `).get(Number(customerId)) || null;
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO Customer (
      full_name,
      address,
      id_type,
      id_number,
      registration_date,
      email,
      phone
    )
    VALUES (?, ?, ?, ?, DATE('now'), ?, ?)
  `);

  const result = stmt.run(
    data.full_name,
    data.address,
    data.id_type,
    data.id_number,
    data.email,
    data.phone
  );

  return getById(result.lastInsertRowid);
}

function update(customerId, data) {
  const existing = getById(customerId);
  if (!existing) return null;

  const updated = {
    full_name: data.full_name !== undefined ? data.full_name : existing.full_name,
    address: data.address !== undefined ? data.address : existing.address,
    id_type: data.id_type !== undefined ? data.id_type : existing.id_type,
    id_number: data.id_number !== undefined ? data.id_number : existing.id_number,
    email: data.email !== undefined ? data.email : existing.email,
    phone: data.phone !== undefined ? data.phone : existing.phone,
  };

  db.prepare(`
    UPDATE Customer
    SET
      full_name = ?,
      address = ?,
      id_type = ?,
      id_number = ?,
      email = ?,
      phone = ?
    WHERE customer_id = ?
  `).run(
    updated.full_name,
    updated.address,
    updated.id_type,
    updated.id_number,
    updated.email,
    updated.phone,
    Number(customerId)
  );

  return getById(customerId);
}

function deleteCustomer(customerId) {
  const result = db.prepare(`
    DELETE FROM Customer
    WHERE customer_id = ?
  `).run(Number(customerId));

  return result.changes > 0;
}

function getBookingsByCustomerId(customerId) {
  return db.prepare(`
    SELECT *
    FROM Booking
    WHERE customer_id = ? AND isDeleted != 1
  `).all(Number(customerId));
}

function getByIdNumber(idNumber) {
  return db.prepare(`
    SELECT *
    FROM Customer
    WHERE id_number = ?
  `).get(String(idNumber)) || null;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCustomer,
  getBookingsByCustomerId,
  getByIdNumber,
};