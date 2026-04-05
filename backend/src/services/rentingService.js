const rentingRepository = require('../repositories/rentingRepository');
const bookingRepository = require('../repositories/bookingRepository');
const hotelRepository = require('../repositories/hotelRepository');
const roomRepository = require('../repositories/roomRepository');
const { customers, employees } = require('../data/mockData');

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

  if (booking.status !== 'confirmed') {
    const error = new Error('Only confirmed bookings can be checked in');
    error.status = 400;
    throw error;
  }

  const employee = employees.find(
    (item) => item.employee_id === Number(data.employee_id)
  );
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
    customer_id: booking.customer_id,
    hotel_id: booking.hotel_id,
    room_number: booking.room_number,
    employee_id: data.employee_id,
    booking_id: booking.booking_id,
    hotel_name_snapshot: booking.hotel_name_snapshot,
    hotel_address_snapshot: booking.hotel_address_snapshot,
    room_number_snapshot: booking.room_number_snapshot,
    check_in_date: booking.start_date,
    check_out_date: booking.end_date,
    actual_check_in: actualCheckIn,
    actual_check_out: null,
    price,
    total_amount: totalAmount,
    payment_method: data.payment_method || null,
    payment_status:
      data.payment_amount && Number(data.payment_amount) > 0 ? 'paid' : 'pending',
  });

  bookingRepository.updateStatus(booking.booking_id, 'checked_in');

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

  const customer = customers.find(
    (item) => item.customer_id === Number(data.customer_id)
  );
  if (!customer) {
    const error = new Error('Customer not found');
    error.status = 400;
    throw error;
  }

  const employee = employees.find(
    (item) => item.employee_id === Number(data.employee_id)
  );
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
  const totalAmount = Number(data.payment_amount) > 0
    ? Number(data.payment_amount)
    : price * nights;

  return rentingRepository.create({
    customer_id: data.customer_id,
    hotel_id: data.hotel_id,
    room_number: data.room_number,
    employee_id: data.employee_id,
    booking_id: null,
    hotel_name_snapshot: `${hotel.chain_name} - ${hotel.area}`,
    hotel_address_snapshot: hotel.address,
    room_number_snapshot: data.room_number,
    check_in_date: data.start_date,
    check_out_date: data.end_date,
    actual_check_in: new Date().toISOString(),
    actual_check_out: null,
    price,
    total_amount: totalAmount,
    payment_method: data.payment_method,
    payment_status: 'paid',
  });
}

function checkOut(rentingId, paymentAmount, paymentMethod) {
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
      paymentAmount !== undefined ? Number(paymentAmount) : renting.total_amount,
    payment_method: paymentMethod || renting.payment_method,
    payment_status: 'paid',
  });

  if (renting.booking_id) {
    bookingRepository.updateStatus(renting.booking_id, 'checked_out');
  }

  return updated;
}

module.exports = {
  getAllRentings,
  getRentingById,
  checkIn,
  directRent,
  checkOut,
};