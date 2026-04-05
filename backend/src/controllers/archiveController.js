const archiveService = require('../services/archiveService');
const { success } = require('../utils/response');

function getAllArchivedBookings(req, res, next) {
  try {
    const archivedBookings = archiveService.getAllArchivedBookings();
    return success(res, archivedBookings);
  } catch (error) {
    next(error);
  }
}

function getArchivedBookingById(req, res, next) {
  try {
    const archivedBooking = archiveService.getArchivedBookingById(
      req.params.archiveId
    );
    return success(res, archivedBooking);
  } catch (error) {
    next(error);
  }
}

function archiveBooking(req, res, next) {
  try {
    const archivedBooking = archiveService.archiveBooking(req.params.bookingId);
    return success(res, archivedBooking, 'Booking archived successfully', 201);
  } catch (error) {
    next(error);
  }
}

function getAllArchivedRentings(req, res, next) {
  try {
    const archivedRentings = archiveService.getAllArchivedRentings();
    return success(res, archivedRentings);
  } catch (error) {
    next(error);
  }
}

function getArchivedRentingById(req, res, next) {
  try {
    const archivedRenting = archiveService.getArchivedRentingById(
      req.params.archiveId
    );
    return success(res, archivedRenting);
  } catch (error) {
    next(error);
  }
}

function archiveRenting(req, res, next) {
  try {
    const archivedRenting = archiveService.archiveRenting(req.params.rentingId);
    return success(res, archivedRenting, 'Renting archived successfully', 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllArchivedBookings,
  getArchivedBookingById,
  archiveBooking,
  getAllArchivedRentings,
  getArchivedRentingById,
  archiveRenting,
};