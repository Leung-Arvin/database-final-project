const { employees } = require('../data/mockData');

function getAll(filters = {}) {
  let results = [...employees];

  if (filters.hotel_id) {
    results = results.filter(
      (employee) => employee.hotel_id === Number(filters.hotel_id)
    );
  }

  if (filters.role) {
    results = results.filter(
      (employee) => employee.role.toLowerCase() === String(filters.role).toLowerCase()
    );
  }

  if (filters.isManager !== undefined) {
    const isManager =
      String(filters.isManager).toLowerCase() === 'true';
    results = results.filter((employee) => employee.isManager === isManager);
  }

  return results;
}

function getById(employeeId) {
  return (
    employees.find(
      (employee) => employee.employee_id === Number(employeeId)
    ) || null
  );
}

function create(data) {
  const newEmployee = {
    employee_id:
      employees.length > 0
        ? Math.max(...employees.map((employee) => employee.employee_id)) + 1
        : 1,
    hotel_id: Number(data.hotel_id),
    full_name: data.full_name,
    address: data.address,
    ssn_sin: data.ssn_sin,
    role: data.role,
    email: data.email,
    phone: data.phone,
    isManager: Boolean(data.isManager),
  };

  employees.push(newEmployee);
  return newEmployee;
}

function update(employeeId, data) {
  const index = employees.findIndex(
    (employee) => employee.employee_id === Number(employeeId)
  );

  if (index === -1) return null;

  employees[index] = {
    ...employees[index],
    ...data,
    employee_id: employees[index].employee_id,
    hotel_id:
      data.hotel_id !== undefined
        ? Number(data.hotel_id)
        : employees[index].hotel_id,
    isManager:
      data.isManager !== undefined
        ? Boolean(data.isManager)
        : employees[index].isManager,
  };

  return employees[index];
}

function deleteEmployee(employeeId) {
  const index = employees.findIndex(
    (employee) => employee.employee_id === Number(employeeId)
  );

  if (index === -1) return false;

  employees.splice(index, 1);
  return true;
}

function getBySsnSin(ssnSin) {
  return (
    employees.find((employee) => employee.ssn_sin === String(ssnSin)) || null
  );
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmployee,
  getBySsnSin,
};