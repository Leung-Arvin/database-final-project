const { hotels } = require('../data/mockData');

function getAll(filters = {}) {
  let results = [...hotels];

  if (filters.chain_id) {
    results = results.filter((hotel) => hotel.chain_id === Number(filters.chain_id));
  }

  if (filters.rating) {
    results = results.filter((hotel) => hotel.rating === Number(filters.rating));
  }

  if (filters.area) {
    results = results.filter((hotel) =>
      hotel.area.toLowerCase().includes(String(filters.area).toLowerCase())
    );
  }

  return results;
}

function getById(hotelId) {
  return hotels.find((hotel) => hotel.hotel_id === Number(hotelId));
}

function create(data) {
  const newHotel = {
    hotel_id: hotels.length > 0
      ? Math.max(...hotels.map((hotel) => hotel.hotel_id)) + 1
      : 1,
    chain_id: Number(data.chain_id),
    chain_name: data.chain_name,
    rating: Number(data.rating),
    address: data.address,
    area: data.area,
    contact_email: data.contact_email,
    manager_employee_id:
      data.manager_employee_id === undefined || data.manager_employee_id === null || data.manager_employee_id === ''
        ? null
        : Number(data.manager_employee_id),
  };

  hotels.push(newHotel);
  return newHotel;
}

function update(hotelId, data) {
  const index = hotels.findIndex((hotel) => hotel.hotel_id === Number(hotelId));

  if (index === -1) return null;

  hotels[index] = {
    ...hotels[index],
    ...data,
    hotel_id: hotels[index].hotel_id,
    chain_id: data.chain_id !== undefined ? Number(data.chain_id) : hotels[index].chain_id,
    rating: data.rating !== undefined ? Number(data.rating) : hotels[index].rating,
    manager_employee_id:
      data.manager_employee_id !== undefined
        ? (data.manager_employee_id === null || data.manager_employee_id === ''
            ? null
            : Number(data.manager_employee_id))
        : hotels[index].manager_employee_id,
  };

  return hotels[index];
}

function remove(hotelId) {
  const index = hotels.findIndex((hotel) => hotel.hotel_id === Number(hotelId));

  if (index === -1) return false;

  hotels.splice(index, 1);
  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};