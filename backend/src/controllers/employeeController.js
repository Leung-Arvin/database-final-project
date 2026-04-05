const employeeService = require('../services/employeeService');
const { success } = require('../utils/response');

function getAll(req, res, next) {
  try {
    const employees = employeeService.getAllEmployees(req.query);
    return success(res, employees);
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const employee = employeeService.getEmployeeById(req.params.employeeId);
    return success(res, employee);
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const employee = employeeService.createEmployee(req.body);
    return success(res, employee, 'Employee created successfully', 201);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const employee = employeeService.updateEmployee(
      req.params.employeeId,
      req.body
    );
    return success(res, employee, 'Employee updated successfully');
  } catch (error) {
    next(error);
  }
}

function deleteEmployee(req, res, next) {
  try {
    employeeService.deleteEmployee(req.params.employeeId);
    return success(res, null, 'Employee deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmployee,
};