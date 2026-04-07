const bookingRepository = require('../repositories/bookingRepository');
const hotelRepository = require('../repositories/hotelRepository');
const roomRepository = require('../repositories/roomRepository');
const customerRepository = require('../repositories/customerRepository');
const hotelChainRepository = require('../repositories/hotelChainRepository');

function getAllBookings(filters) {
  return bookingRepository.getAll(filters);
}

function getBookingById(bookingId) {
  const booking = bookingRepository.getById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  return booking;
}

function createBooking(data) {
  if (
    !data.customer_id ||
    !data.hotel_id ||
    !data.room_number ||
    !data.start_date ||
    !data.end_date ||
    data.booking_price === undefined
  ) {
    const error = new Error(
      'customer_id, hotel_id, room_number, start_date, end_date, and booking_price are required'
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    const error = new Error('Invalid start_date or end_date');
    error.status = 400;
    throw error;
  }

  if (startDate < today) {
    const error = new Error('start_date cannot be in the past');
    error.status = 400;
    throw error;
  }

  if (endDate <= startDate) {
    const error = new Error('end_date must be after start_date');
    error.status = 400;
    throw error;
  }

  if (Number(data.booking_price) <= 0) {
    const error = new Error('booking_price must be greater than 0');
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
    const error = new Error('Room is not available for the selected date range');
    error.status = 400;
    throw error;
  }

  const chain = hotelChainRepository.getById(hotel.chain_id);

  if (!chain) {
    const error = new Error('Hotel chain not found');
    error.status = 400;
    throw error;
  }

  return bookingRepository.create({
    customer_id: data.customer_id,
    hotel_id: data.hotel_id,
    room_number: Number(data.room_number),
    hotel_name_snapshot: `${chain.chain_name} - ${hotel.area}`,
    hotel_address_snapshot: hotel.address,
    room_number_snapshot: Number(data.room_number),
    start_date: data.start_date,
    end_date: data.end_date,
    booking_price: data.booking_price,
    status: 'active',
  });
}

function updateBookingStatus(bookingId, status) {
  const booking = bookingRepository.getById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  const allowedStatuses = ['active', 'cancelled', 'converted_to_renting'];

  if (!allowedStatuses.includes(status)) {
    const error = new Error('Invalid booking status');
    error.status = 400;
    throw error;
  }

  return bookingRepository.updateStatus(bookingId, status);
}

function cancelBooking(bookingId) {
  const booking = bookingRepository.getById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (booking.status === 'converted_to_renting') {
    const error = new Error('Cannot cancel a booking that has already been converted to renting');
    error.status = 400;
    throw error;
  }

  return bookingRepository.updateStatus(bookingId, 'cancelled');
}

function confirmBooking(bookingId) {
  const booking = bookingRepository.getById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (booking.status === 'cancelled') {
    const error = new Error('Cannot confirm a cancelled booking');
    error.status = 400;
    throw error;
  }

  return bookingRepository.updateStatus(bookingId, 'active');
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  confirmBooking,
};