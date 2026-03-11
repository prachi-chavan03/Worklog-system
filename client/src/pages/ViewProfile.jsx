import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Briefcase, Shield } from 'lucide-react';

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
  // 1. Session Guard: Redirect to login if no user found
  const session = sessionStorage.getItem('user');
  if (!session) {
    navigate('/');
    return;
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  fetchProfile();
}, [id, navigate, API_BASE_URL]);
  if (!employee) return <div className="p-10 text-center text-gray-400">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex flex-col items-center">
      {/* Back Navigation */}
      <div className="w-full max-w-2xl mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-all font-medium text-sm"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e293b]">User Profile</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mt-1"> Account Details</p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-gray-50 text-[#334155] font-semibold">
              <User size={18} className="text-blue-500" />
              {employee.full_name}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-gray-50 text-[#334155] font-semibold">
              <Mail size={18} className="text-blue-500" />
              {employee.email}
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
            <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-gray-50 text-[#334155] font-semibold">
              <Briefcase size={18} className="text-blue-500" />
              {employee.designation || "Not Set"}
            </div>
          </div>

          {/* Account Role */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
            <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-gray-50 text-[#334155] font-semibold">
              <Shield size={18} className="text-blue-500" />
              <span className="capitalize">{employee.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;