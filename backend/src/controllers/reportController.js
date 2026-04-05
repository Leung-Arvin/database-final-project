const reportService = require('../services/reportService');
const { success } = require('../utils/response');

function getAvailableRoomsPerArea(req, res, next) {
  try {
    const report = reportService.getAvailableRoomsPerAreaReport();
    return success(res, report);
  } catch (error) {
    next(error);
  }
}

function getRoomCapacityByHotel(req, res, next) {
  try {
    const report = reportService.getRoomCapacityByHotelReport();
    return success(res, report);
  } catch (error) {
    next(error);
  }
}

function getRoomCapacityByHotelId(req, res, next) {
  try {
    const report = reportService.getRoomCapacityByHotelIdReport(
      req.params.hotelId
    );
    return success(res, report);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAvailableRoomsPerArea,
  getRoomCapacityByHotel,
  getRoomCapacityByHotelId,
};