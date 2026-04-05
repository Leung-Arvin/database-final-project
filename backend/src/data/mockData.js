const hotelChains = [
  {
    chain_id: 1,
    chain_name: 'Luxury Hotels International',
    central_office_address: '123 Park Avenue, New York, NY 10001',
  },
  {
    chain_id: 2,
    chain_name: 'Premier Inn Group',
    central_office_address: '456 Bay Street, Toronto, ON M5H 2T5',
  },
];

const hotels = [
  {
    hotel_id: 1,
    chain_id: 1,
    chain_name: 'Luxury Hotels International',
    rating: 5,
    address: '100 Broadway',
    area: 'New York, NY',
    contact_email: 'manhattan@luxuryhotels.com',
    manager_employee_id: 1,
  },
  {
    hotel_id: 2,
    chain_id: 2,
    chain_name: 'Premier Inn Group',
    rating: 3,
    address: '200 Front Street',
    area: 'Toronto, ON',
    contact_email: 'toronto@premierinn.com',
    manager_employee_id: 4,
  },
  {
    hotel_id: 3,
    chain_id: 2,
    chain_name: 'Premier Inn Group',
    rating: 3,
    address: '150 Albert Street',
    area: 'Ottawa, ON',
    contact_email: 'ottawa@premierinn.com',
    manager_employee_id: 5,
  },
];

const rooms = [
  {
    hotel_id: 1,
    room_number: '101',
    base_price: 250,
    capacity: 'double',
    view_type: 'city',
    extendable: true,
  },
  {
    hotel_id: 1,
    room_number: '102',
    base_price: 320,
    capacity: 'triple',
    view_type: 'sea',
    extendable: false,
  },
  {
    hotel_id: 2,
    room_number: '201',
    base_price: 180,
    capacity: 'single',
    view_type: 'city',
    extendable: false,
  },
  {
    hotel_id: 2,
    room_number: '202',
    base_price: 220,
    capacity: 'double',
    view_type: 'city',
    extendable: true,
  },
];

const roomAmenities = [
  { hotel_id: 1, room_number: '101', amenity: 'WiFi' },
  { hotel_id: 1, room_number: '101', amenity: 'TV' },
  { hotel_id: 1, room_number: '102', amenity: 'WiFi' },
  { hotel_id: 2, room_number: '201', amenity: 'AC' },
];

const roomProblems = [
  {
    problem_id: 1,
    hotel_id: 1,
    room_number: '102',
    description: 'Broken lamp',
    reported_date: '2026-04-01',
    resolved_date: null,
  },
];

const customers = [
  {
    customer_id: 1,
    full_name: 'John Smith',
    address: '12 Main Street, New York, NY',
    id_type: 'SSN',
    id_number: '111-22-3333',
    registration_date: '2026-01-10',
    email: 'john.smith@email.com',
    phone: '555-111-2222',
  },
  {
    customer_id: 2,
    full_name: 'Alice Brown',
    address: '45 King Street, Toronto, ON',
    id_type: 'SIN',
    id_number: '987654321',
    registration_date: '2026-02-05',
    email: 'alice.brown@email.com',
    phone: '555-333-4444',
  },
];

const employees = [
  {
    employee_id: 1,
    hotel_id: 1,
    full_name: 'Michael Manager',
    address: '1 Manager St, New York, NY',
    ssn_sin: '123456789',
    role: 'manager',
    email: 'michael.manager@luxuryhotels.com',
    phone: '555-111-0000',
    isManager: true,
  },
  {
    employee_id: 4,
    hotel_id: 2,
    full_name: 'Sarah Clerk',
    address: '2 Front St, Toronto, ON',
    ssn_sin: '987654321',
    role: 'clerk',
    email: 'sarah.clerk@premierinn.com',
    phone: '555-222-0000',
    isManager: false,
  },
  {
    employee_id: 5,
    hotel_id: 3,
    full_name: 'David Manager',
    address: '3 Albert St, Ottawa, ON',
    ssn_sin: '456789123',
    role: 'manager',
    email: 'david.manager@premierinn.com',
    phone: '555-333-0000',
    isManager: true,
  },
];

const bookings = [
  {
    booking_id: 1,
    customer_id: 1,
    hotel_id: 1,
    room_number: '101',
    hotel_name_snapshot: 'Luxury Hotels International - New York, NY',
    hotel_address_snapshot: '100 Broadway',
    room_number_snapshot: '101',
    start_date: '2026-04-20',
    end_date: '2026-04-23',
    booking_price: 750,
    status: 'checked_in',
    isDeleted: false,
  },
];

const rentings = [
  {
    renting_id: 1,
    customer_id: 1,
    hotel_id: 1,
    room_number: '101',
    employee_id: 1,
    booking_id: 1,
    hotel_name_snapshot: 'Luxury Hotels International - New York, NY',
    hotel_address_snapshot: '100 Broadway',
    room_number_snapshot: '101',
    check_in_date: '2026-04-20',
    check_out_date: '2026-04-23',
    actual_check_in: '2026-04-20T15:00:00.000Z',
    actual_check_out: null,
    price: 250,
    total_amount: 750,
    payment_method: 'credit_card',
    payment_status: 'paid',
    isDeleted: false,
  },
];

const archiveBookings = [];
const archiveRentings = [];

module.exports = {
  hotelChains,
  hotels,
  rooms,
  roomAmenities,
  roomProblems,
  bookings,
  rentings,
  customers,
  employees,
  archiveBookings,
  archiveRentings,
};