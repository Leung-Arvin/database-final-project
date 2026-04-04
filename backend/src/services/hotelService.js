const hotelRepository = require('../repositories/hotelRepository');
const hotelChainRepository = require('../repositories/hotelChainRepository');
const roomRepository = require('../repositories/roomRepository');

function getAllHotels(filters) {
  return hotelRepository.getAll(filters);
}

function getHotelById(hotelId) {
  const hotel = hotelRepository.getById(hotelId);

  if (!hotel) {
    const error = new Error('Hotel not found');
    error.status = 404;
    throw error;
  }

  return hotel;
}

function createHotel(data) {
  if (
    !data.chain_id ||
    !data.rating ||
    !data.address ||
    !data.area ||
    !data.contact_email
  ) {
    const error = new Error('chain_id, rating, address, area, and contact_email are required');
    error.status = 400;
    throw error;
  }

  if (Number(data.rating) < 1 || Number(data.rating) > 5) {
    const error = new Error('rating must be between 1 and 5');
    error.status = 400;
    throw error;
  }

  const chain = hotelChainRepository.getById(data.chain_id);

  if (!chain) {
    const error = new Error('Referenced hotel chain does not exist');
    error.status = 400;
    throw error;
  }

  const hotelToCreate = {
    ...data,
    chain_name: chain.chain_name,
  };

  return hotelRepository.create(hotelToCreate);
}

function updateHotel(hotelId, data) {
  const existingHotel = hotelRepository.getById(hotelId);

  if (!existingHotel) {
    const error = new Error('Hotel not found');
    error.status = 404;
    throw error;
  }

  let chainName = existingHotel.chain_name;

  if (data.chain_id !== undefined) {
    const chain = hotelChainRepository.getById(data.chain_id);

    if (!chain) {
      const error = new Error('Referenced hotel chain does not exist');
      error.status = 400;
      throw error;
    }

    chainName = chain.chain_name;
  }

  if (data.rating !== undefined) {
    const rating = Number(data.rating);
    if (rating < 1 || rating > 5) {
      const error = new Error('rating must be between 1 and 5');
      error.status = 400;
      throw error;
    }
  }

  return hotelRepository.update(hotelId, {
    ...data,
    chain_name: chainName,
  });
}

function deleteHotel(hotelId) {
  const existingHotel = hotelRepository.getById(hotelId);

  if (!existingHotel) {
    const error = new Error('Hotel not found');
    error.status = 404;
    throw error;
  }

  hotelRepository.remove(hotelId);
}

function getRoomsForHotel(hotelId) {
  const existingHotel = hotelRepository.getById(hotelId);

  if (!existingHotel) {
    const error = new Error('Hotel not found');
    error.status = 404;
    throw error;
  }

  return roomRepository.getByHotelId(hotelId);
}

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getRoomsForHotel,
};