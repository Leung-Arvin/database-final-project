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

module.exports = {
  getAllArchivedBookings,
  getArchivedBookingById,
  getAllArchivedRentings,
  getArchivedRentingById,
};