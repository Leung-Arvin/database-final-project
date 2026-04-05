const { rentings } = require('../data/mockData');

function getAll() {
  return rentings.filter((renting) => renting.isDeleted !== true);
}

function getById(rentingId) {
  return (
    rentings.find(
      (renting) =>
        renting.renting_id === Number(rentingId) && renting.isDeleted !== true
    ) || null
  );
}

function create(data) {
  const newRenting = {
    renting_id:
      rentings.length > 0
        ? Math.max(...rentings.map((renting) => renting.renting_id)) + 1
        : 1,
    customer_id: Number(data.customer_id),
    hotel_id: Number(data.hotel_id),
    room_number: String(data.room_number),
    employee_id: Number(data.employee_id),
    booking_id:
      data.booking_id === null || data.booking_id === undefined
        ? null
        : Number(data.booking_id),
    hotel_name_snapshot: data.hotel_name_snapshot,
    hotel_address_snapshot: data.hotel_address_snapshot,
    room_number_snapshot: String(data.room_number_snapshot),
    check_in_date: data.check_in_date,
    check_out_date: data.check_out_date,
    actual_check_in: data.actual_check_in || null,
    actual_check_out: data.actual_check_out || null,
    price: Number(data.price),
    total_amount: Number(data.total_amount),
    payment_method: data.payment_method || null,
    payment_status: data.payment_status || 'pending',
    isDeleted: false,
  };

  rentings.push(newRenting);
  return newRenting;
}

function update(rentingId, data) {
  const index = rentings.findIndex(
    (renting) =>
      renting.renting_id === Number(rentingId) && renting.isDeleted !== true
  );

  if (index === -1) return null;

  rentings[index] = {
    ...rentings[index],
    ...data,
    renting_id: rentings[index].renting_id,
    customer_id:
      data.customer_id !== undefined
        ? Number(data.customer_id)
        : rentings[index].customer_id,
    hotel_id:
      data.hotel_id !== undefined
        ? Number(data.hotel_id)
        : rentings[index].hotel_id,
    employee_id:
      data.employee_id !== undefined
        ? Number(data.employee_id)
        : rentings[index].employee_id,
    booking_id:
      data.booking_id !== undefined
        ? data.booking_id === null
          ? null
          : Number(data.booking_id)
        : rentings[index].booking_id,
    price:
      data.price !== undefined ? Number(data.price) : rentings[index].price,
    total_amount:
      data.total_amount !== undefined
        ? Number(data.total_amount)
        : rentings[index].total_amount,
  };

  return rentings[index];
}

function findActiveOverlap(hotelId, roomNumber, startDate, endDate) {
  return rentings.filter((renting) => {
    if (renting.isDeleted === true) return false;
    if (renting.hotel_id !== Number(hotelId)) return false;
    if (renting.room_number !== String(roomNumber)) return false;

    return renting.check_in_date < endDate && renting.check_out_date > startDate;
  });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  findActiveOverlap,
};