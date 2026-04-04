const { rooms } = require('../data/mockData');

function getByHotelId(hotelId) {
  return rooms.filter((room) => room.hotel_id === Number(hotelId));
}

module.exports = {
  getByHotelId,
};