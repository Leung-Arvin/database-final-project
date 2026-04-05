const rentingService = require('../services/rentingService');
const { success } = require('../utils/response');

function getAll(req, res, next) {
  try {
    const rentings = rentingService.getAllRentings();
    return success(res, rentings);
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const renting = rentingService.getRentingById(req.params.rentingId);
    return success(res, renting);
  } catch (error) {
    next(error);
  }
}

function checkIn(req, res, next) {
  try {
    const renting = rentingService.checkIn(req.body);
    return success(res, renting, 'Check-in completed successfully', 201);
  } catch (error) {
    next(error);
  }
}

function directRent(req, res, next) {
  try {
    const renting = rentingService.directRent(req.body);
    return success(res, renting, 'Direct renting created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function checkOut(req, res, next) {
  try {
    const renting = rentingService.checkOut(
      req.params.rentingId,
      req.body.payment_amount,
      req.body.payment_method
    );
    return success(res, renting, 'Check-out completed successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  checkIn,
  directRent,
  checkOut,
};