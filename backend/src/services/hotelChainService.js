const hotelChainRepository = require('../repositories/hotelChainRepository');

function getAllHotelChains() {
  return hotelChainRepository.getAll();
}

function getHotelChainById(chainId) {
  const chain = hotelChainRepository.getById(chainId);

  if (!chain) {
    const error = new Error('Hotel chain not found');
    error.status = 404;
    throw error;
  }

  return chain;
}

function createHotelChain(data) {
  if (!data.chain_name || !data.central_office_address) {
    const error = new Error('chain_name and central_office_address are required');
    error.status = 400;
    throw error;
  }

  return hotelChainRepository.create(data);
}

function updateHotelChain(chainId, data) {
  const existingChain = hotelChainRepository.getById(chainId);

  if (!existingChain) {
    const error = new Error('Hotel chain not found');
    error.status = 404;
    throw error;
  }

  return hotelChainRepository.update(chainId, data);
}

function deleteHotelChain(chainId) {
  const existingChain = hotelChainRepository.getById(chainId);

  if (!existingChain) {
    const error = new Error('Hotel chain not found');
    error.status = 404;
    throw error;
  }

  hotelChainRepository.remove(chainId);
}

function getHotelsForChain(chainId) {
  const existingChain = hotelChainRepository.getById(chainId);

  if (!existingChain) {
    const error = new Error('Hotel chain not found');
    error.status = 404;
    throw error;
  }

  return hotelChainRepository.getHotelsByChainId(chainId);
}

module.exports = {
  getAllHotelChains,
  getHotelChainById,
  createHotelChain,
  updateHotelChain,
  deleteHotelChain,
  getHotelsForChain,
};