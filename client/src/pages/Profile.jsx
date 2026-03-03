import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, ArrowLeft, Briefcase } from 'lucide-react'; // Added Briefcase icon

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load the SPECIFIC logged-in person's data
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUserData(savedUser);
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!userData) return null;

  const isAdmin = userData.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold transition-all">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-white border-b border-gray-100 p-8">
            <h1 className="text-2xl font-black text-gray-800">My Profile</h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">
              {/* UPDATED: Changed 'Employee Account' to 'User Account' */}
              {isAdmin ? 'Administrator Account' : 'User Account'}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* NAME SECTION */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-blue-600" />
                </div>
                {isAdmin ? (
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    defaultValue={userData.name || userData.full_name}
                  />
                ) : (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700">
                    {userData.name || userData.full_name}
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
                <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-500">
                  {userData.email}
                </div>
              </div>
            </div>

            {/* NEW SECTION: DESIGNATION (Below Email) */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Designation</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Briefcase size={18} className="text-blue-600" />
                </div>
                {isAdmin ? (
                  <input 
                    type="text" 
                    placeholder="Enter designation (Optional)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    defaultValue={userData.designation || ""}
                  />
                ) : (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700">
                    {userData.designation || "Not Set"}
                  </div>
                )}
              </div>
            </div>

            {/* ROLE SECTION (Corrected label to 'Account Role') */}
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

            {/* Show Update button ONLY for Admin */}
            {isAdmin && (
              <div className="pt-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95">
                  Update Profile
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