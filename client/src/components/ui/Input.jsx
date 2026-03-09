import React from 'react';

export const Input = ({ label, ...props }) => (
  <div className="mb-4 text-left">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <input 
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  </div>
);