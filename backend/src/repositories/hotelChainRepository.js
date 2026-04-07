const db = require('../db');

function getAll() {
  const stmt = db.prepare(`
    SELECT
      chain_id,
      chain_name,
      central_office_address
    FROM HotelChain
    ORDER BY chain_id
  `);

  return stmt.all();
}

function getById(chainId) {
  const stmt = db.prepare(`
    SELECT
      chain_id,
      chain_name,
      central_office_address
    FROM HotelChain
    WHERE chain_id = ?
  `);

  return stmt.get(Number(chainId)) || null;
}

function create(data) {
  const insertStmt = db.prepare(`
    INSERT INTO HotelChain (
      chain_name,
      central_office_address
    )
    VALUES (?, ?)
  `);

  const result = insertStmt.run(
    data.chain_name,
    data.central_office_address
  );

  return getById(result.lastInsertRowid);
}

function update(chainId, data) {
  const existingChain = getById(chainId);

  if (!existingChain) return null;

  const updatedChain = {
    chain_name:
      data.chain_name !== undefined
        ? data.chain_name
        : existingChain.chain_name,
    central_office_address:
      data.central_office_address !== undefined
        ? data.central_office_address
        : existingChain.central_office_address,
  };

  const updateStmt = db.prepare(`
    UPDATE HotelChain
    SET
      chain_name = ?,
      central_office_address = ?
    WHERE chain_id = ?
  `);

  updateStmt.run(
    updatedChain.chain_name,
    updatedChain.central_office_address,
    Number(chainId)
  );

  return getById(chainId);
}

function remove(chainId) {
  const deleteStmt = db.prepare(`
    DELETE FROM HotelChain
    WHERE chain_id = ?
  `);

  const result = deleteStmt.run(Number(chainId));
  return result.changes > 0;
}

function getHotelsByChainId(chainId) {
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
    WHERE chain_id = ?
    ORDER BY hotel_id
  `);

  return stmt.all(Number(chainId));
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getHotelsByChainId,
};