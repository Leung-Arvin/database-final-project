const hotelChainService = require('../services/hotelChainService');
const { success } = require('../utils/response');

function getAll(req, res, next) {
  try {
    const chains = hotelChainService.getAllHotelChains();
    return success(res, chains);
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const chain = hotelChainService.getHotelChainById(req.params.chainId);
    return success(res, chain);
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const chain = hotelChainService.createHotelChain(req.body);
    return success(res, chain, 'Hotel chain created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const chain = hotelChainService.updateHotelChain(req.params.chainId, req.body);
    return success(res, chain, 'Hotel chain updated successfully');
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    hotelChainService.deleteHotelChain(req.params.chainId);
    return success(res, null, 'Hotel chain deleted successfully');
  } catch (error) {
    next(error);
  }
}

function getHotels(req, res, next) {
  try {
    const hotels = hotelChainService.getHotelsForChain(req.params.chainId);
    return success(res, hotels);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getHotels,
};