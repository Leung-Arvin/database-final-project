const customerService = require('../services/customerService');
const { success } = require('../utils/response');

function getAll(req, res, next) {
  try {
    const customers = customerService.getAllCustomers();
    return success(res, customers);
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const customer = customerService.getCustomerById(req.params.customerId);
    return success(res, customer);
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const customer = customerService.createCustomer(req.body);
    return success(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const customer = customerService.updateCustomer(
      req.params.customerId,
      req.body
    );
    return success(res, customer, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
}

function deleteCustomer(req, res, next) {
  try {
    customerService.deleteCustomer(req.params.customerId);
    return success(res, null, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
}

function getBookings(req, res, next) {
  try {
    const bookings = customerService.getCustomerBookings(req.params.customerId);
    return success(res, bookings);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCustomer,
  getBookings,
};