const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, '../data/hotel-database.db'));

function getAll(filters = {}) {
  let query = `
    SELECT
      hotel_id,
      chain_id,
      rating,
      address,
      area,
      contact_email,
      manager_employee_id
    FROM Hotel
  `;

  const conditions = [];
  const params = [];

  if (filters.chain_id !== undefined && filters.chain_id !== '') {
    conditions.push('chain_id = ?');
    params.push(Number(filters.chain_id));
  }

  if (filters.rating !== undefined && filters.rating !== '') {
    conditions.push('rating = ?');
    params.push(Number(filters.rating));
  }

  if (filters.area !== undefined && filters.area !== '') {
    conditions.push('LOWER(area) LIKE LOWER(?)');
    params.push(`%${String(filters.area)}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY hotel_id';

  return db.prepare(query).all(...params);
}

function getById(hotelId) {
  const stmt = db.prepare(`
    SELECT
      hotel_id,
      chain_id,
      rating,
      address,
      area,
      contact_email,
      manager_employee_id
    FROM Hotel
    WHERE hotel_id = ?
  `);

  return stmt.get(Number(hotelId)) || null;
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO Hotel (
      chain_id,
      rating,
      address,
      area,
      contact_email,
      manager_employee_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    Number(data.chain_id),
    Number(data.rating),
    data.address,
    data.area,
    data.contact_email,
    data.manager_employee_id === undefined ||
    data.manager_employee_id === null ||
    data.manager_employee_id === ''
      ? null
      : Number(data.manager_employee_id)
  );

  return getById(result.lastInsertRowid);
}

function update(hotelId, data) {
  const existingHotel = getById(hotelId);

  if (!existingHotel) return null;

  const updatedHotel = {
    chain_id:
      data.chain_id !== undefined ? Number(data.chain_id) : existingHotel.chain_id,
    rating:
      data.rating !== undefined ? Number(data.rating) : existingHotel.rating,
    address:
      data.address !== undefined ? data.address : existingHotel.address,
    area:
      data.area !== undefined ? data.area : existingHotel.area,
    contact_email:
      data.contact_email !== undefined ? data.contact_email : existingHotel.contact_email,
    manager_employee_id:
      data.manager_employee_id !== undefined
        ? (data.manager_employee_id === null || data.manager_employee_id === ''
            ? null
            : Number(data.manager_employee_id))
        : existingHotel.manager_employee_id,
  };

  const stmt = db.prepare(`
    UPDATE Hotel
    SET
      chain_id = ?,
      rating = ?,
      address = ?,
      area = ?,
      contact_email = ?,
      manager_employee_id = ?
    WHERE hotel_id = ?
  `);

  stmt.run(
    updatedHotel.chain_id,
    updatedHotel.rating,
    updatedHotel.address,
    updatedHotel.area,
    updatedHotel.contact_email,
    updatedHotel.manager_employee_id,
    Number(hotelId)
  );

  return getById(hotelId);
}

function remove(hotelId) {
  const stmt = db.prepare(`
    DELETE FROM Hotel
    WHERE hotel_id = ?
  `);

  const result = stmt.run(Number(hotelId));
  return result.changes > 0;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};