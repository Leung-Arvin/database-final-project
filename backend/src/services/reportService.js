const reportRepository = require('../repositories/reportRepository');
const hotelRepository = require('../repositories/hotelRepository');

function getAvailableRoomsPerAreaReport() {
  return reportRepository.getAvailableRoomsPerArea();
}

function getRoomCapacityByHotelReport() {
  return reportRepository.getRoomCapacityByHotel();
}

function getRoomCapacityByHotelIdReport(hotelId) {
  const hotel = hotelRepository.getById(hotelId);

  if (!hotel) {
    const error = new Error('Hotel not found');
    error.status = 404;
    throw error;
  }

  return reportRepository.getRoomCapacityByHotelId(hotelId);
}

function getHotelsAboveAverageCapacityReport() {
  return reportRepository.getHotelsAboveAverageCapacity();
}

module.exports = {
  getAvailableRoomsPerAreaReport,
  getRoomCapacityByHotelReport,
  getRoomCapacityByHotelIdReport,
  getHotelsAboveAverageCapacityReport,
};