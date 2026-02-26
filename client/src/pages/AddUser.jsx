import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isEmployee: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: formData.isEmployee ? 'employee' : 'non-employee'
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("User created successfully!");
        navigate('/admin-dashboard');
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("Server error. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-all">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <UserPlus /> Add New System User
            </h2>
            <p className="text-blue-100 mt-1">Fill in the details to create a new account.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input type="password" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input type="password" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <input type="checkbox" id="roleCheck" checked={formData.isEmployee} className="w-5 h-5 accent-blue-600"
                onChange={(e) => setFormData({...formData, isEmployee: e.target.checked})} />
              <label htmlFor="roleCheck" className="text-sm font-bold text-blue-800 cursor-pointer">
                Register as Employee (Uncheck for Non-Employee)
              </label>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
              <Save size={20} /> CREATE USER
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;