const archiveRepository = require('../repositories/archiveRepository');

function getAllArchivedBookings() {
  return archiveRepository.getAllArchivedBookings();
}

function getArchivedBookingById(archiveId) {
  const archivedBooking = archiveRepository.getArchivedBookingById(archiveId);

  if (!archivedBooking) {
    const error = new Error('Archived booking not found');
    error.status = 404;
    throw error;
  }

  return archivedBooking;
}

function getAllArchivedRentings() {
  return archiveRepository.getAllArchivedRentings();
}

function getArchivedRentingById(archiveId) {
  const archivedRenting = archiveRepository.getArchivedRentingById(archiveId);

  if (!archivedRenting) {
    const error = new Error('Archived renting not found');
    error.status = 404;
    throw error;
  }

  return archivedRenting;
}

module.exports = {
  getAllArchivedBookings,
  getArchivedBookingById,
  getAllArchivedRentings,
  getArchivedRentingById,
};