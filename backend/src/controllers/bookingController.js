const bookingService = require('../services/bookingService');
const { success } = require('../utils/response');

function getAll(req, res, next) {
  try {
    const bookings = bookingService.getAllBookings(req.query);
    return success(res, bookings);
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const booking = bookingService.getBookingById(req.params.bookingId);
    return success(res, booking);
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const booking = bookingService.createBooking(req.body);
    return success(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function updateStatus(req, res, next) {
  try {
    const booking = bookingService.updateBookingStatus(
      req.params.bookingId,
      req.body.status
    );
    return success(res, booking, 'Booking status updated successfully');
  } catch (error) {
    next(error);
  }
}

function cancel(req, res, next) {
  try {
    const booking = bookingService.cancelBooking(req.params.bookingId);
    return success(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
}

function confirm(req, res, next) {
  try {
    const booking = bookingService.confirmBooking(req.params.bookingId);
    return success(res, booking, 'Booking confirmed successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  updateStatus,
  cancel,
  confirm,
};