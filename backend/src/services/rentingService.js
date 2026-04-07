const rentingRepository = require('../repositories/rentingRepository');
const bookingRepository = require('../repositories/bookingRepository');
const hotelRepository = require('../repositories/hotelRepository');
const hotelChainRepository = require('../repositories/hotelChainRepository');
const roomRepository = require('../repositories/roomRepository');
const customerRepository = require('../repositories/customerRepository');
const employeeRepository = require('../repositories/employeeRepository');

function getAllRentings() {
  return rentingRepository.getAll();
}

function getRentingById(rentingId) {
  const renting = rentingRepository.getById(rentingId);

  if (!renting) {
    const error = new Error('Renting not found');
    error.status = 404;
    throw error;
  }

  return renting;
}

function checkIn(data) {
  if (!data.booking_id || !data.employee_id) {
    const error = new Error('booking_id and employee_id are required');
    error.status = 400;
    throw error;
  }

  const booking = bookingRepository.getById(data.booking_id);
  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (booking.status !== 'active') {
    const error = new Error('Only active bookings can be checked in');
    error.status = 400;
    throw error;
  }

  const employee = employeeRepository.getById(data.employee_id);
  if (!employee) {
    const error = new Error('Employee not found');
    error.status = 400;
    throw error;
  }

  if (employee.hotel_id !== booking.hotel_id) {
    const error = new Error('Employee does not belong to this hotel');
    error.status = 400;
    throw error;
  }

  const room = roomRepository.getByCompositeKey(
    booking.hotel_id,
    booking.room_number
  );
  if (!room) {
    const error = new Error('Room not found');
    error.status = 400;
    throw error;
  }

  const activeProblem = roomRepository.getActiveProblem(
    booking.hotel_id,
    booking.room_number
  );
  if (activeProblem) {
    const error = new Error('Room is currently unavailable due to an active problem');
    error.status = 400;
    throw error;
  }

  const overlappingRentings = rentingRepository.findActiveOverlap(
    booking.hotel_id,
    booking.room_number,
    booking.start_date,
    booking.end_date
  );

  if (overlappingRentings.length > 0) {
    const error = new Error('Room is already rented for the selected date range');
    error.status = 400;
    throw error;
  }

  const actualCheckIn = new Date().toISOString();

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(booking.end_date) - new Date(booking.start_date)) /
        (1000 * 60 * 60 * 24)
    )
  );

  const price = Number(room.base_price);
  const totalAmount = price * nights;

  const renting = rentingRepository.create({
    customer_id: Number(booking.customer_id),
    hotel_id: Number(booking.hotel_id),
    room_number: Number(booking.room_number),
    employee_id: Number(data.employee_id),
    booking_id: Number(booking.booking_id),
    hotel_name_snapshot: booking.hotel_name_snapshot,
    hotel_address_snapshot: booking.hotel_address_snapshot,
    room_number_snapshot: Number(booking.room_number_snapshot),
    check_in_date: booking.start_date,
    check_out_date: booking.end_date,
    actual_check_in: actualCheckIn,
    actual_check_out: null,
    price,
    total_amount: totalAmount,
    payment_method: data.payment_method || null,
  });

  bookingRepository.updateStatus(booking.booking_id, 'converted_to_renting');
  bookingRepository.softDelete(booking.booking_id);

  return renting;
}

function directRent(data) {
  if (
    !data.customer_id ||
    !data.hotel_id ||
    !data.room_number ||
    !data.employee_id ||
    !data.start_date ||
    !data.end_date ||
    data.payment_amount === undefined ||
    !data.payment_method
  ) {
    const error = new Error(
      'customer_id, hotel_id, room_number, employee_id, start_date, end_date, payment_amount, and payment_method are required'
    );
    error.status = 400;
    throw error;
  }

  const customer = customerRepository.getById(data.customer_id);
  if (!customer) {
    const error = new Error('Customer not found');
    error.status = 400;
    throw error;
  }

  const employee = employeeRepository.getById(data.employee_id);
  if (!employee) {
    const error = new Error('Employee not found');
    error.status = 400;
    throw error;
  }

  if (employee.hotel_id !== Number(data.hotel_id)) {
    const error = new Error('Employee does not belong to this hotel');
    error.status = 400;
    throw error;
  }

  const hotel = hotelRepository.getById(data.hotel_id);
  if (!hotel) {
    const error = new Error('Hotel not found');
    error.status = 400;
    throw error;
  }

  const chain = hotelChainRepository.getById(hotel.chain_id);
  if (!chain) {
    const error = new Error('Hotel chain not found');
    error.status = 400;
    throw error;
  }

  const room = roomRepository.getByCompositeKey(data.hotel_id, data.room_number);
  if (!room) {
    const error = new Error('Room not found for this hotel');
    error.status = 400;
    throw error;
  }

  const activeProblem = roomRepository.getActiveProblem(
    data.hotel_id,
    data.room_number
  );
  if (activeProblem) {
    const error = new Error('Room is currently unavailable due to an active problem');
    error.status = 400;
    throw error;
  }

  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    const error = new Error('Invalid start_date or end_date');
    error.status = 400;
    throw error;
  }

  if (endDate <= startDate) {
    const error = new Error('end_date must be after start_date');
    error.status = 400;
    throw error;
  }

  const overlappingBookings = bookingRepository.findOverlappingBookings(
    data.hotel_id,
    data.room_number,
    data.start_date,
    data.end_date
  );

  if (overlappingBookings.length > 0) {
    const error = new Error('Room already has a booking for the selected date range');
    error.status = 400;
    throw error;
  }

  const overlappingRentings = rentingRepository.findActiveOverlap(
    data.hotel_id,
    data.room_number,
    data.start_date,
    data.end_date
  );

  if (overlappingRentings.length > 0) {
    const error = new Error('Room is already rented for the selected date range');
    error.status = 400;
    throw error;
  }

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(data.end_date) - new Date(data.start_date)) /
        (1000 * 60 * 60 * 24)
    )
  );

  const price = Number(room.base_price);
  const totalAmount =
    Number(data.payment_amount) > 0
      ? Number(data.payment_amount)
      : price * nights;

  return rentingRepository.create({
    customer_id: Number(data.customer_id),
    hotel_id: Number(data.hotel_id),
    room_number: Number(data.room_number),
    employee_id: Number(data.employee_id),
    booking_id: null,
    hotel_name_snapshot: `${chain.chain_name} - ${hotel.area}`,
    hotel_address_snapshot: hotel.address,
    room_number_snapshot: Number(data.room_number),
    check_in_date: data.start_date,
    check_out_date: data.end_date,
    actual_check_in: new Date().toISOString(),
    actual_check_out: null,
    price,
    total_amount: totalAmount,
    payment_method: data.payment_method,
  });
}

function checkOut(rentingId, payment_amount, payment_method) {
  const renting = rentingRepository.getById(rentingId);

  if (!renting) {
    const error = new Error('Renting not found');
    error.status = 404;
    throw error;
  }

  if (renting.actual_check_out) {
    const error = new Error('Renting has already been checked out');
    error.status = 400;
    throw error;
  }

  const updated = rentingRepository.update(rentingId, {
    actual_check_out: new Date().toISOString(),
    total_amount:
      payment_amount !== undefined ? Number(payment_amount) : renting.total_amount,
    payment_method: payment_method || renting.payment_method,
  });

  rentingRepository.softDelete(rentingId);

  return updated;
}

module.exports = {
  getAllRentings,
  getRentingById,
  checkIn,
  directRent,
  checkOut,
};