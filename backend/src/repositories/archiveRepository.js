const db = require('../db');

function getAllArchivedBookings() {
  return db.prepare(`
    SELECT *
    FROM BookingArchive
    ORDER BY archive_booking_id
  `).all();
}

function getArchivedBookingById(archiveId) {
  return (
    db.prepare(`
      SELECT *
      FROM BookingArchive
      WHERE archive_booking_id = ?
    `).get(Number(archiveId)) || null
  );
}

function getAllArchivedRentings() {
  return db.prepare(`
    SELECT *
    FROM RentingArchive
    ORDER BY archive_renting_id
  `).all();
}

function getArchivedRentingById(archiveId) {
  return (
    db.prepare(`
      SELECT *
      FROM RentingArchive
      WHERE archive_renting_id = ?
    `).get(Number(archiveId)) || null
  );
}

module.exports = {
  getAllArchivedBookings,
  getArchivedBookingById,
  getAllArchivedRentings,
  getArchivedRentingById,
};