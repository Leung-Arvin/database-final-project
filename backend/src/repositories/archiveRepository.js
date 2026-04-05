const {
  archiveBookings,
  archiveRentings,
  bookings,
  rentings,
} = require('../data/mockData');

function getAllArchivedBookings() {
  return archiveBookings;
}

function getArchivedBookingById(archiveId) {
  return (
    archiveBookings.find(
      (item) => item.archive_booking_id === Number(archiveId)
    ) || null
  );
}

function archiveBooking(bookingId) {
  const booking = bookings.find(
    (item) =>
      item.booking_id === Number(bookingId) && item.isDeleted !== true
  );

  if (!booking) return null;

  const alreadyArchived = archiveBookings.find(
    (item) => item.original_booking_id === Number(bookingId)
  );

  if (alreadyArchived) return alreadyArchived;

  const newArchivedBooking = {
    archive_booking_id:
      archiveBookings.length > 0
        ? Math.max(...archiveBookings.map((item) => item.archive_booking_id)) + 1
        : 1,
    original_booking_id: booking.booking_id,
    archived_at: new Date().toISOString(),
    data: { ...booking },
  };

  archiveBookings.push(newArchivedBooking);
  return newArchivedBooking;
}

function getAllArchivedRentings() {
  return archiveRentings;
}

function getArchivedRentingById(archiveId) {
  return (
    archiveRentings.find(
      (item) => item.archive_renting_id === Number(archiveId)
    ) || null
  );
}

function archiveRenting(rentingId) {
  const renting = rentings.find(
    (item) =>
      item.renting_id === Number(rentingId) && item.isDeleted !== true
  );

  if (!renting) return null;

  const alreadyArchived = archiveRentings.find(
    (item) => item.original_renting_id === Number(rentingId)
  );

  if (alreadyArchived) return alreadyArchived;

  const newArchivedRenting = {
    archive_renting_id:
      archiveRentings.length > 0
        ? Math.max(...archiveRentings.map((item) => item.archive_renting_id)) + 1
        : 1,
    original_renting_id: renting.renting_id,
    archived_at: new Date().toISOString(),
    data: { ...renting },
  };

  archiveRentings.push(newArchivedRenting);
  return newArchivedRenting;
}

module.exports = {
  getAllArchivedBookings,
  getArchivedBookingById,
  archiveBooking,
  getAllArchivedRentings,
  getArchivedRentingById,
  archiveRenting,
};