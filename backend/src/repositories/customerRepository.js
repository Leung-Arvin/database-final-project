const { customers, bookings } = require('../data/mockData');

function getAll() {
  return customers;
}

function getById(customerId) {
  return (
    customers.find(
      (customer) => customer.customer_id === Number(customerId)
    ) || null
  );
}

function create(data) {
  const newCustomer = {
    customer_id:
      customers.length > 0
        ? Math.max(...customers.map((customer) => customer.customer_id)) + 1
        : 1,
    full_name: data.full_name,
    address: data.address,
    id_type: data.id_type,
    id_number: data.id_number,
    registration_date: new Date().toISOString().split('T')[0],
    email: data.email,
    phone: data.phone,
  };

  customers.push(newCustomer);
  return newCustomer;
}

function update(customerId, data) {
  const index = customers.findIndex(
    (customer) => customer.customer_id === Number(customerId)
  );

  if (index === -1) return null;

  customers[index] = {
    ...customers[index],
    ...data,
    customer_id: customers[index].customer_id,
    registration_date: customers[index].registration_date,
  };

  return customers[index];
}

function deleteCustomer(customerId) {
  const index = customers.findIndex(
    (customer) => customer.customer_id === Number(customerId)
  );

  if (index === -1) return false;

  customers.splice(index, 1);
  return true;
}

function getBookingsByCustomerId(customerId) {
  return bookings.filter(
    (booking) =>
      booking.customer_id === Number(customerId) &&
      booking.isDeleted !== true
  );
}

function getByIdNumber(idNumber) {
  return (
    customers.find((customer) => customer.id_number === String(idNumber)) || null
  );
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCustomer,
  getBookingsByCustomerId,
  getByIdNumber,
};