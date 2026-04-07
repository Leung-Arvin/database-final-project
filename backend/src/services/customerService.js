const customerRepository = require('../repositories/customerRepository');

function getAllCustomers() {
  return customerRepository.getAll();
}

function getCustomerById(customerId) {
  const customer = customerRepository.getById(customerId);

  if (!customer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return customer;
}

function createCustomer(data) {
  if (
    !data.full_name ||
    !data.email ||
    !data.phone ||
    !data.address ||
    !data.id_type ||
    !data.id_number
  ) {
    const error = new Error(
      'full_name, email, phone, address, id_type, and id_number are required'
    );
    error.status = 400;
    throw error;
  }

  const existingCustomer = customerRepository.getByGovernmentId(
    data.id_type,
    data.id_number
  );
  if (existingCustomer) {
    const error = new Error('A customer with this id_number already exists');
    error.status = 400;
    throw error;
  }

  return customerRepository.create(data);
}

function updateCustomer(customerId, data) {
  const existingCustomer = customerRepository.getById(customerId);

  if (!existingCustomer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  const nextIdType =
    data.id_type !== undefined ? data.id_type : existingCustomer.id_type;
  const nextIdNumber =
    data.id_number !== undefined ? data.id_number : existingCustomer.id_number;

  if (
    nextIdType !== existingCustomer.id_type ||
    nextIdNumber !== existingCustomer.id_number
  ) {
    const duplicateCustomer = customerRepository.getByGovernmentId(
      nextIdType,
      nextIdNumber
    );

    if (
      duplicateCustomer &&
      duplicateCustomer.customer_id !== existingCustomer.customer_id
    ) {
      const error = new Error('A customer with this id_type and id_number already exists');
      error.status = 400;
      throw error;
    }
  }

  return customerRepository.update(customerId, data);
}

function deleteCustomer(customerId) {
  const existingCustomer = customerRepository.getById(customerId);

  if (!existingCustomer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  customerRepository.delete(customerId);
}

function getCustomerBookings(customerId) {
  const existingCustomer = customerRepository.getById(customerId);

  if (!existingCustomer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return customerRepository.getBookingsByCustomerId(customerId);
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
};