const db = require('../db');

function getAll(filters = {}) {
  let query = `
    SELECT
      employee_id,
      hotel_id,
      full_name,
      address,
      ssn_sin,
      role,
      email,
      phone
    FROM Employee
  `;

  const conditions = [];
  const params = [];

  if (filters.hotel_id !== undefined && filters.hotel_id !== '') {
    conditions.push('hotel_id = ?');
    params.push(Number(filters.hotel_id));
  }

  if (filters.role !== undefined && filters.role !== '') {
    conditions.push('LOWER(role) = LOWER(?)');
    params.push(String(filters.role));
  }

  if (filters.isManager !== undefined && filters.isManager !== '') {
    const isManager = String(filters.isManager).toLowerCase() === 'true';
    conditions.push(isManager ? "LOWER(role) = 'manager'" : "LOWER(role) != 'manager'");
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY employee_id';

  return db.prepare(query).all(...params);
}

function getById(employeeId) {
  return db.prepare(`
    SELECT
      employee_id,
      hotel_id,
      full_name,
      address,
      ssn_sin,
      role,
      email,
      phone
    FROM Employee
    WHERE employee_id = ?
  `).get(Number(employeeId)) || null;
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO Employee (
      hotel_id,
      full_name,
      address,
      ssn_sin,
      role,
      email,
      phone
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    Number(data.hotel_id),
    data.full_name,
    data.address,
    Number(data.ssn_sin),
    data.role,
    data.email,
    data.phone
  );

  return getById(result.lastInsertRowid);
}

function update(employeeId, data) {
  const existing = getById(employeeId);
  if (!existing) return null;

  const updated = {
    hotel_id: data.hotel_id !== undefined ? Number(data.hotel_id) : existing.hotel_id,
    full_name: data.full_name !== undefined ? data.full_name : existing.full_name,
    address: data.address !== undefined ? data.address : existing.address,
    ssn_sin: data.ssn_sin !== undefined ? Number(data.ssn_sin) : existing.ssn_sin,
    role: data.role !== undefined ? data.role : existing.role,
    email: data.email !== undefined ? data.email : existing.email,
    phone: data.phone !== undefined ? data.phone : existing.phone,
  };

  db.prepare(`
    UPDATE Employee
    SET
      hotel_id = ?,
      full_name = ?,
      address = ?,
      ssn_sin = ?,
      role = ?,
      email = ?,
      phone = ?
    WHERE employee_id = ?
  `).run(
    updated.hotel_id,
    updated.full_name,
    updated.address,
    updated.ssn_sin,
    updated.role,
    updated.email,
    updated.phone,
    Number(employeeId)
  );

  return getById(employeeId);
}

function deleteEmployee(employeeId) {
  const result = db.prepare(`
    DELETE FROM Employee
    WHERE employee_id = ?
  `).run(Number(employeeId));

  return result.changes > 0;
}

function getBySsnSin(ssnSin) {
  return db.prepare(`
    SELECT
      employee_id,
      hotel_id,
      full_name,
      address,
      ssn_sin,
      role,
      email,
      phone
    FROM Employee
    WHERE ssn_sin = ?
  `).get(Number(ssnSin)) || null;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmployee,
  getBySsnSin,
};