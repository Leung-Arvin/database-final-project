const { hotelChains, hotels } = require('../data/mockData');

function getAll() {
  return hotelChains;
}

function getById(chainId) {
  return hotelChains.find((chain) => chain.chain_id === Number(chainId));
}

function create(data) {
  const newChain = {
    chain_id: hotelChains.length > 0
      ? Math.max(...hotelChains.map((chain) => chain.chain_id)) + 1
      : 1,
    chain_name: data.chain_name,
    central_office_address: data.central_office_address,
  };

  hotelChains.push(newChain);
  return newChain;
}

function update(chainId, data) {
  const index = hotelChains.findIndex((chain) => chain.chain_id === Number(chainId));

  if (index === -1) return null;

  hotelChains[index] = {
    ...hotelChains[index],
    ...data,
    chain_id: hotelChains[index].chain_id,
  };

  return hotelChains[index];
}

function remove(chainId) {
  const index = hotelChains.findIndex((chain) => chain.chain_id === Number(chainId));

  if (index === -1) return false;

  hotelChains.splice(index, 1);
  return true;
}

function getHotelsByChainId(chainId) {
  return hotels.filter((hotel) => hotel.chain_id === Number(chainId));
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getHotelsByChainId,
};