const db = require('../db');

function getByHotelId(hotelId) {
  const stmt = db.prepare(`
    SELECT *
    FROM Room
    WHERE hotel_id = ?
    ORDER BY room_number
  `);

  return stmt.all(Number(hotelId));
}

function getByCompositeKey(hotelId, roomNumber) {
  const stmt = db.prepare(`
    SELECT *
    FROM Room
    WHERE hotel_id = ? AND room_number = ?
  `);

  return stmt.get(Number(hotelId), Number(roomNumber)) || null;
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO Room (
      hotel_id,
      room_number,
      base_price,
      capacity,
      view_type,
      extendable
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    Number(data.hotel_id),
    Number(data.room_number),
    Number(data.base_price),
    data.capacity,
    data.view_type,
    data.extendable ? 1 : 0
  );

  return getByCompositeKey(data.hotel_id, data.room_number);
}

function update(hotelId, roomNumber, data) {
  const existing = getByCompositeKey(hotelId, roomNumber);
  if (!existing) return null;

  const updated = {
    base_price:
      data.base_price !== undefined ? Number(data.base_price) : existing.base_price,
    capacity:
      data.capacity !== undefined ? data.capacity : existing.capacity,
    view_type:
      data.view_type !== undefined ? data.view_type : existing.view_type,
    extendable:
      data.extendable !== undefined
        ? (data.extendable ? 1 : 0)
        : existing.extendable,
  };

  const stmt = db.prepare(`
    UPDATE Room
    SET base_price = ?, capacity = ?, view_type = ?, extendable = ?
    WHERE hotel_id = ? AND room_number = ?
  `);

  stmt.run(
    updated.base_price,
    updated.capacity,
    updated.view_type,
    updated.extendable,
    Number(hotelId),
    Number(roomNumber)
  );

  return getByCompositeKey(hotelId, roomNumber);
}

function remove(hotelId, roomNumber) {
  const stmt = db.prepare(`
    DELETE FROM Room
    WHERE hotel_id = ? AND room_number = ?
  `);

  const result = stmt.run(Number(hotelId), Number(roomNumber));
  return result.changes > 0;
}

function getAmenities(hotelId, roomNumber) {
  const stmt = db.prepare(`
    SELECT amenity
    FROM RoomAmenity
    WHERE hotel_id = ? AND room_number = ?
  `);

  return stmt.all(Number(hotelId), Number(roomNumber)).map(a => a.amenity);
}

function addAmenity(hotelId, roomNumber, amenity) {
  const stmt = db.prepare(`
    INSERT INTO RoomAmenity (hotel_id, room_number, amenity)
    VALUES (?, ?, ?)
  `);

  stmt.run(Number(hotelId), Number(roomNumber), amenity);
}

function removeAmenity(hotelId, roomNumber, amenity) {
  const stmt = db.prepare(`
    DELETE FROM RoomAmenity
    WHERE hotel_id = ? AND room_number = ? AND amenity = ?
  `);

  const result = stmt.run(Number(hotelId), Number(roomNumber), amenity);
  return result.changes > 0;
}

function getActiveProblem(hotelId, roomNumber) {
  const stmt = db.prepare(`
    SELECT *
    FROM RoomProblem
    WHERE hotel_id = ? AND room_number = ? AND resolved_date IS NULL
  `);

  return stmt.get(Number(hotelId), Number(roomNumber)) || null;
}

function createProblem(hotelId, roomNumber, description) {
  const stmt = db.prepare(`
    INSERT INTO RoomProblem (
      hotel_id,
      room_number,
      description,
      reported_date,
      resolved_date
    )
    VALUES (?, ?, ?, DATE('now'), NULL)
  `);

  const result = stmt.run(
    Number(hotelId),
    Number(roomNumber),
    description
  );

  return db.prepare(`
    SELECT *
    FROM RoomProblem
    WHERE problem_id = ?
  `).get(result.lastInsertRowid);
}

function resolveProblem(problemId) {
  const stmt = db.prepare(`
    UPDATE RoomProblem
    SET resolved_date = DATE('now')
    WHERE problem_id = ?
  `);

  const result = stmt.run(Number(problemId));
  if (result.changes === 0) return null;

  return db.prepare(`
    SELECT *
    FROM RoomProblem
    WHERE problem_id = ?
  `).get(problemId);
}

function search(filters = {}) {
  let query = `
    SELECT r.*
    FROM Room r
    JOIN Hotel h ON r.hotel_id = h.hotel_id
  `;

  const conditions = [];
  const params = [];

  if (filters.hotel_id) {
    conditions.push('r.hotel_id = ?');
    params.push(Number(filters.hotel_id));
  }

  if (filters.capacity) {
    conditions.push('r.capacity = ?');
    params.push(filters.capacity);
  }

  if (filters.min_price !== undefined) {
    conditions.push('r.base_price >= ?');
    params.push(Number(filters.min_price));
  }

  if (filters.max_price !== undefined) {
    conditions.push('r.base_price <= ?');
    params.push(Number(filters.max_price));
  }

  if (filters.area) {
    conditions.push('LOWER(h.area) LIKE LOWER(?)');
    params.push(`%${filters.area}%`);
  }

  if (filters.hotel_chain_id) {
    conditions.push('h.chain_id = ?');
    params.push(Number(filters.hotel_chain_id));
  }

  if (filters.rating) {
    conditions.push('h.rating = ?');
    params.push(Number(filters.rating));
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  return db.prepare(query).all(...params);
}

module.exports = {
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