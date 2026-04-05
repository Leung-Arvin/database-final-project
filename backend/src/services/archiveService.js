const archiveRepository = require('../repositories/archiveRepository');
const bookingRepository = require('../repositories/bookingRepository');
const rentingRepository = require('../repositories/rentingRepository');

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

function archiveBooking(bookingId) {
  const booking = bookingRepository.getById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  return archiveRepository.archiveBooking(bookingId);
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

function archiveRenting(rentingId) {
  const renting = rentingRepository.getById(rentingId);

  if (!renting) {
    const error = new Error('Renting not found');
    error.status = 404;
    throw error;
  }

  return archiveRepository.archiveRenting(rentingId);
}

module.exports = {
  getAllArchivedBookings,
  getArchivedBookingById,
  archiveBooking,
  getAllArchivedRentings,
  getArchivedRentingById,
  archiveRenting,
};