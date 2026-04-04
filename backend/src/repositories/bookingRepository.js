const { bookings } = require('../data/mockData');

function getAll(filters = {}) {
  let results = [...bookings];

  if (filters.status) {
    results = results.filter((booking) => booking.status === filters.status);
  }

  if (filters.hotel_id) {
    results = results.filter(
      (booking) => booking.hotel_id === Number(filters.hotel_id)
    );
  }

  if (filters.customer_id) {
    results = results.filter(
      (booking) => booking.customer_id === Number(filters.customer_id)
    );
  }

  return results.filter((booking) => booking.isDeleted !== true);
}

function getById(bookingId) {
  return (
    bookings.find(
      (booking) =>
        booking.booking_id === Number(bookingId) && booking.isDeleted !== true
    ) || null
  );
}

function create(data) {
  const newBooking = {
    booking_id:
      bookings.length > 0
        ? Math.max(...bookings.map((booking) => booking.booking_id)) + 1
        : 1,
    customer_id: Number(data.customer_id),
    hotel_id: Number(data.hotel_id),
    room_number: String(data.room_number),
    hotel_name_snapshot: data.hotel_name_snapshot,
    hotel_address_snapshot: data.hotel_address_snapshot,
    room_number_snapshot: String(data.room_number_snapshot),
    start_date: data.start_date,
    end_date: data.end_date,
    booking_price: Number(data.booking_price),
    status: data.status || 'confirmed',
    isDeleted: false,
  };

  bookings.push(newBooking);
  return newBooking;
}

function updateStatus(bookingId, status) {
  const booking = bookings.find(
    (item) =>
      item.booking_id === Number(bookingId) && item.isDeleted !== true
  );

  if (!booking) return null;

  booking.status = status;
  return booking;
}

function softDelete(bookingId) {
  const booking = bookings.find(
    (item) =>
      item.booking_id === Number(bookingId) && item.isDeleted !== true
  );

  if (!booking) return null;

  booking.isDeleted = true;
  return booking;
}

function findOverlappingBookings(hotelId, roomNumber, startDate, endDate) {
  return bookings.filter((booking) => {
    if (booking.isDeleted === true) return false;
    if (booking.hotel_id !== Number(hotelId)) return false;
    if (booking.room_number !== String(roomNumber)) return false;
    if (booking.status === 'cancelled') return false;
    if (booking.status === 'checked_out') return false;

    return booking.start_date < endDate && booking.end_date > startDate;
  });
}

module.exports = {
  getAll,
  getById,
  create,
  updateStatus,
  softDelete,
  findOverlappingBookings,
};