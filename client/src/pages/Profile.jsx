import { Eye, EyeOff } from 'lucide-react';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, ArrowLeft, Briefcase, Lock } from 'lucide-react'; 
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const { id, userId } = useParams(); 
  const targetUserId = userId || id; 

  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    designation: '',
    role: '',
    isAdmin: false,
    status: 'active', 
    password: '',
    confirmPassword: ''
  });

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const isAdminEditingOthers = (loggedInUser?.role === 'Admin' || loggedInUser?.role === 'admin') && userId;

  const handleUpdate = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    const selectedRole = formData.isAdmin ? 'admin' : 'employee';

    try {
      // FIX 1: Ensure no values are 'undefined' before sending to backend
      const payload = {
        full_name: formData.full_name || '',
        email: formData.email || '',
        designation: formData.designation || '',
       role: selectedRole,
        status: formData.status || 'active',
        password: formData.password || '',
       employee_id: userData.employee_id || userData.userEmployeeId
      };

      const response = await fetch(`${API_BASE_URL}/admin/update-user/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // Send payload instead of formData directly
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditMode(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Failed to update.");
      }
    } catch (error) {
      toast.error("Server error occurred.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (targetUserId) {
        try {
          const response = await fetch(`${API_BASE_URL}/tasks/get-user-info/${targetUserId}`);
          const data = await response.json();

          if (response.ok) {
            const fetchedUser = {
              full_name: data.userName || "User",
              email: data.userEmail || '', 
              designation: data.userDesignation || '',
              role: data.userRole || 'Employee',
              status: data.userStatus || 'active', // FIX 2: Default fallback
              employee_id: data.userEmployeeId,
              id: targetUserId
            };
            
            setUserData(fetchedUser);
            setFormData({
              full_name: fetchedUser.full_name,
              email: fetchedUser.email,
              designation: fetchedUser.designation,
              role: fetchedUser.role,
              isAdmin: (data.userRole || "").toLowerCase() === 'admin',
              
              status: fetchedUser.status, 
              password: '',
              confirmPassword: ''
            });
          }
        } catch (err) {
          console.error("Error fetching target user:", err);
        }
      } else {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser) {
          setUserData(savedUser);
          setFormData({
            full_name: savedUser.full_name || savedUser.name,
            email: savedUser.email,
            designation: savedUser.designation || '',
            role: savedUser.role,
            isAdmin: fetchedUser.role.toLowerCase() === 'admin',
            status: 'active', // Added safety
            password: '',
            confirmPassword: ''
          });
        } else {
          navigate('/');
        }
      }
    };

    fetchUserData();
  }, [targetUserId, navigate]);

  if (!userData) return <div className="p-10 text-center font-bold">Loading Profile...</div>;

  const isAdmin = userData.role === 'Admin' || userData.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold transition-all">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-white border-b border-gray-100 p-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-800">
                {isAdminEditingOthers ? "Edit User Profile" : "My Profile"}
              </h1>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">
                {isAdmin ? 'Administrator Account' : 'User Account'}
              </p>
            </div>
            {isAdminEditingOthers && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${isEditMode ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
              >
                {isEditMode ? 'CANCEL' : 'EDIT PROFILE'}
              </button>
            )}
          </div>

          <div className="p-8 space-y-6">
            {/* NAME SECTION */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-blue-600" />
                </div>
                {isEditMode ? (
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                ) : (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700">
                    {userData.full_name || userData.name}
                  </div>
                )}
              </div>
            </div>

            {/* EMAIL SECTION */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                {isEditMode ? (
                  <input 
                    type="email" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-500">
                    {userData.email}
                  </div>
                )}
              </div>
            </div>

            {/* DESIGNATION SECTION */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Designation</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Briefcase size={18} className="text-blue-600" />
                </div>
                {isEditMode ? (
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  />
                ) : (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700">
                    {userData.designation || "Not Set"}
                  </div>
                )}
              </div>
            </div>

            {/* ROLE SECTION */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Account Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Shield size={18} className="text-blue-600" />
                </div>
                <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 capitalize">
                  {userData.role}
                </div>
              </div>
            </div>

            {/* ADMIN CHECKBOX COMPONENT */}
{isEditMode && isAdminEditingOthers && (
  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 mt-2">
    <input 
      type="checkbox" 
      id="adminCheck" 
      checked={formData.isAdmin} 
      className="w-5 h-5 accent-purple-600 cursor-pointer"
      onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})} 
    />
    <label htmlFor="adminCheck" className="text-sm font-bold text-purple-800 cursor-pointer">
      Assign Admin Role (Access to full management)
    </label>
  </div>
)}

            {/* ACCOUNT STATUS SECTION */}
            {isEditMode && isAdminEditingOthers && (
              <div className="pt-4 border-t border-dashed space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account Status</label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox"
                    id="statusToggle"
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                    checked={(formData?.status || 'active') === 'active'} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      status: e.target.checked ? 'active' : 'inactive'
                    })}
                  />
                  <label htmlFor="statusToggle" className="font-bold text-sm text-gray-700 cursor-pointer">
                    Account is <span className={(formData?.status || 'active') === 'active' ? "text-green-600" : "text-red-600"}>
                      {/* FIX 3: Safe call to toUpperCase using fallback */}
                      {(formData?.status || 'active').toUpperCase()}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* PASSWORD SECTION */}
            {isEditMode && (
              <div className="pt-4 border-t border-dashed space-y-4">
                <label className="block text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Reset Password</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <Lock size={18} className="text-red-400" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="New Password"
                      autoComplete="new-password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-100 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <Lock size={18} className="text-red-400" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm New Password"
                      autoComplete="new-password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-100 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500"
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isEditMode && isAdminEditingOthers && (
              <div className="pt-4">
                <button 
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  Confirm & Update Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;