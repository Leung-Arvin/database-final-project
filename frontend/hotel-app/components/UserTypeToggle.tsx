import React from 'react';

const UserTypeToggle = ({ isEmployee, onToggle }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg w-fit border border-gray-200">
      <span className={`text-sm font-medium ${!isEmployee ? 'text-blue-600' : 'text-gray-500'}`}>
        Customer
      </span>
      
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isEmployee}
          onChange={onToggle}
        />
        {/* The Slider Track */}
        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
      </label>

      <span className={`text-sm font-medium ${isEmployee ? 'text-indigo-600' : 'text-gray-500'}`}>
        Employee
      </span>
    </div>
  );
};

export default UserTypeToggle;