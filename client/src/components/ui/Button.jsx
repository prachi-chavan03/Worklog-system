import React from 'react';
export const Button = ({ children, ...props }) => (
  <button 
    {...props}
    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 flex justify-center items-center"
  >
    {children}
  </button>
);