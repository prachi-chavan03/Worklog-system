import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, ShieldCheck } from 'lucide-react'; 
import toast from 'react-hot-toast';

const AddUser = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    designation: '', 
    password: '',
    confirmPassword: '',
    isEmployee: true,
    isAdmin: false // New state for admin check
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-user`, {
        //
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          designation: formData.designation, 
          password: formData.password,
          // Sending both flags so the backend can determine role and employee_id
          isEmployee: formData.isEmployee,
          isAdmin: formData.isAdmin
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

          <form onSubmit={handleSubmit} className="p-8 space-y-5" autoCorrect="off">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required 
                  name="new_user_email_unique"
                  autoComplete="off"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Designation (Optional)</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Software Engineer"
                  onChange={(e) => setFormData({...formData, designation: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  required 
                  name="new_user_password_unique"
                  autoComplete="new-password"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  required 
                  name="confirm_user_password_unique"
                  autoComplete="new-password"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
            </div>

            {/* Checkbox Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <input 
                  type="checkbox" 
                  id="roleCheck" 
                  checked={formData.isEmployee} 
                  className="w-5 h-5 accent-blue-600"
                  onChange={(e) => setFormData({...formData, isEmployee: e.target.checked})} 
                />
                <label htmlFor="roleCheck" className="text-sm font-bold text-blue-800 cursor-pointer">
                  Register as Employee (Access to self-task entry)
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <input 
                  type="checkbox" 
                  id="adminCheck" 
                  checked={formData.isAdmin} 
                  className="w-5 h-5 accent-purple-600"
                  onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})} 
                />
                <label htmlFor="adminCheck" className="text-sm font-bold text-purple-800 cursor-pointer">
                  Assign Admin Role (Access to full management)
                </label>
              </div>
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