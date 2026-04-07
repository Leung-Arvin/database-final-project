const employeeRepository = require('../repositories/employeeRepository');
const hotelRepository = require('../repositories/hotelRepository');

function getAllEmployees(filters) {
  return employeeRepository.getAll(filters);
}

function getEmployeeById(employeeId) {
  const employee = employeeRepository.getById(employeeId);

  if (!employee) {
    const error = new Error('Employee not found');
    error.status = 404;
    throw error;
  }

  return employee;
}

function createEmployee(data) {
  if (
    !data.full_name ||
    !data.email ||
    !data.phone ||
    !data.address ||
    !data.hotel_id ||
    !data.role ||
    !data.ssn_sin
  ) {
    const error = new Error(
      'full_name, email, phone, address, hotel_id, role, and ssn_sin are required'
    );
    error.status = 400;
    throw error;
  }

  const hotel = hotelRepository.getById(data.hotel_id);
  if (!hotel) {
    const error = new Error('Referenced hotel does not exist');
    error.status = 400;
    throw error;
  }

  const existingEmployee = employeeRepository.getBySsnSin(data.ssn_sin);
  if (existingEmployee) {
    const error = new Error('An employee with this ssn_sin already exists');
    error.status = 400;
    throw error;
  }

  return employeeRepository.create(data);
}

function updateEmployee(employeeId, data) {
  const existingEmployee = employeeRepository.getById(employeeId);

  if (!existingEmployee) {
    const error = new Error('Employee not found');
    error.status = 404;
    throw error;
  }

  if (data.hotel_id !== undefined) {
    const hotel = hotelRepository.getById(data.hotel_id);
    if (!hotel) {
      const error = new Error('Referenced hotel does not exist');
      error.status = 400;
      throw error;
    }
  }

  if (
    data.ssn_sin !== undefined &&
    Number(data.ssn_sin) !== Number(existingEmployee.ssn_sin)
  ) {
    const duplicateEmployee = employeeRepository.getBySsnSin(data.ssn_sin);
    if (duplicateEmployee) {
      const error = new Error('An employee with this ssn_sin already exists');
      error.status = 400;
      throw error;
    }
  }

  return employeeRepository.update(employeeId, data);
}

function deleteEmployee(employeeId) {
  const existingEmployee = employeeRepository.getById(employeeId);

  if (!existingEmployee) {
    const error = new Error('Employee not found');
    error.status = 404;
    throw error;
  }

  employeeRepository.delete(employeeId);
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};