import { Eye, EyeOff } from 'lucide-react';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, ArrowLeft, Briefcase, Lock,Phone, MapPin, Cake, GraduationCap, Wrench } from 'lucide-react'; 
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

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode was enabled in another page
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    designation: '',
    role: '',
    isAdmin: false,
    status: 'active', 
    password: '',
    confirmPassword: '',

    mobile: '',
  address: '',
  dob: '',
  date_of_joining: '',
  skills: '',
  education: ''

  });

  // Updated to sessionStorage
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const isAdminEditingOthers = (loggedInUser?.role === 'Admin' || loggedInUser?.role === 'admin') && userId;

  const handleUpdate = async () => {
  if (formData.password && formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match!");
    return;
  }

  // Identify if this user is an actual employee (has an ID)
  const hasEmployeeId = userData.employee_id || userData.userEmployeeId;
  let selectedRole;

  if (formData.isAdmin) {
    // 1. If checkbox is Ticked -> Role is always Admin
    selectedRole = 'admin';
  } else {
    // 2. If checkbox is UNTICKED:
    if (hasEmployeeId) {
      // If they have an employee_id, they MUST revert to 'employee'
      selectedRole = 'employee';
    } else {
      // If no employee_id, check if they were admin. 
      // If they were, and we untick, they become 'user' or stay their special role
      const previousRole = (userData.role || "").toLowerCase();
      selectedRole = previousRole === 'admin' ? 'user' : userData.role;
    }
  }

  try {
    const payload = {
      full_name: formData.full_name || '',
      email: formData.email || '',
      designation: formData.designation || '',
      role: selectedRole,
      status: formData.status || 'active',
      password: formData.password || '',
      // Always preserve the employee_id if it exists
      employee_id: hasEmployeeId || null ,

      mobile: formData.mobile,
  address: formData.address,
  dob: formData.dob,
  date_of_joining: formData.date_of_joining,
  skills: formData.skills,
  education: formData.education,
    };

    const response = await fetch(`${API_BASE_URL}/admin/update-user/${targetUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      toast.success("Profile Updated successfully");
      setIsEditMode(false);
      
      // Safety: If editing self, update session
      if (loggedInUser?.id === targetUserId) {
        const updatedSession = { ...loggedInUser, role: selectedRole };
        sessionStorage.setItem("user", JSON.stringify(updatedSession));
      }

      setTimeout(() => { window.location.reload(); }, 1500);
    } else {
      toast.error("Failed to update.");
    }
  } catch (error) {
    toast.error("Server error.");
  }
};
  useEffect(() => {
  const fetchUserData = async () => {
    // 1. Get the current session user
    const savedUser = JSON.parse(sessionStorage.getItem("user"));
    
    // 2. Identify whose ID we need: either the URL param OR the logged-in user's ID
    const idToFetch = targetUserId || savedUser?.id;

    if (idToFetch) {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/get-user-info/${idToFetch}`);
        const data = await response.json();

        if (response.ok) {
          const fetchedUser = {
            full_name: data.userName || "User",
            email: data.userEmail || '',
            designation: data.userDesignation || '',
            role: data.userRole || 'Employee',
            status: data.userStatus || 'active',
            employee_id: data.userEmployeeId,
            id: idToFetch,
            mobile: data.userMobile || '',
            address: data.userAddress || '',
            dob: data.userDob ? data.userDob.split('T')[0] : '',
            date_of_joining: data.userDoj ? data.userDoj.split('T')[0] : '',
            skills: data.userSkills || '',
            education: data.userEducation || '',
          };

          setUserData(fetchedUser);
          setFormData({
            ...fetchedUser, // Spread the fetched data directly
            isAdmin: (data.userRole || "").toLowerCase() === 'admin',
            password: '',
            confirmPassword: '',
          });

          // 3. SYNC STEP: If the user is viewing THEIR OWN profile, 
          // update sessionStorage so the Header/Sidebar reflects the Admin's changes immediately.
          if (!targetUserId || targetUserId === savedUser?.id) {
            const updatedSession = { ...savedUser, ...fetchedUser };
            sessionStorage.setItem("user", JSON.stringify(updatedSession));
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    } else {
      navigate('/');
    }
  };

  fetchUserData();
}, [targetUserId, navigate, API_BASE_URL]);
 

  if (!userData) return <div className="p-10 text-center font-bold">Loading Profile...</div>;

  const isAdmin = userData.role === 'Admin' || userData.role === 'admin';

  return (
   <div className="min-h-screen dark:bg-gray-900 bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 dark:text-gray-400 text-gray-500 hover:text-blue-600 mb-6 font-bold transition-all">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black dark:text-white text-gray-800">
                {isAdminEditingOthers ? "Edit User Profile" : "My Profile"}
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">
                {isAdmin ? 'Administrator Account' : 'User Account'}
              </p>
            </div>
            {isAdminEditingOthers && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${isEditMode ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}
              >
                {isEditMode ? 'CANCEL' : 'EDIT PROFILE'}
              </button>
            )}
          </div>

          <div className="p-8 space-y-6">
            {/* NAME SECTION */}
            <div>
              <label className="block text-[10px] dark:text-gray-500 font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-blue-600" />
                </div>
                {isEditMode ? (
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                ) : (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 font-bold text-gray-700">
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
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 bg-gray-50 border border-gray-100 font-bold text-gray-500">
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
                  <div className="w-full pl-11 pr-4 py-3 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700">
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
                <div className="w-full pl-11 pr-4 py-3 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 capitalize">
                  {userData.role}
                </div>
              </div>
            </div>
        {/* NEW FIELDS SECTION */}
{/* NEW FIELDS SECTION */}
<div className="pt-6 border-t border-gray-100">
  <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Personal & Professional Details</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Mobile */}
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Mobile Number</label>
      {isEditMode ? (
        <input 
          type="text" 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.mobile}
          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200">
          {userData.mobile || "Not Provided"}
        </div>
      )}
    </div>

    {/* Education */}
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Education</label>
      {isEditMode ? (
        <input 
          type="text" 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.education}
          onChange={(e) => setFormData({...formData, education: e.target.value})}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200">
          {userData.education || "Not Provided"}
        </div>
      )}
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    {/* Date of Birth */}
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Date of Birth</label>
      {isEditMode ? (
        <input 
          type="date" 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.dob}
          onChange={(e) => setFormData({...formData, dob: e.target.value})}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200">
          {userData.dob || "Not Provided"}
        </div>
      )}
    </div>

    {/* Date of Joining */}
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Date of Joining</label>
      {isEditMode ? (
        <input 
          type="date" 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.date_of_joining}
          onChange={(e) => setFormData({...formData, date_of_joining: e.target.value})}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200">
          {userData.date_of_joining || "Not Provided"}
        </div>
      )}
    </div>
  </div>

  {/* Full Width Fields */}
  <div className="mt-6 space-y-6">
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Skills</label>
      {isEditMode ? (
        <input 
          type="text" 
          placeholder="e.g. React, Node.js, SQL"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.skills}
          onChange={(e) => setFormData({...formData, skills: e.target.value})}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200">
          {userData.skills || "No skills listed"}
        </div>
      )}
    </div>

    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Address</label>
      {isEditMode ? (
        <textarea 
          rows="2"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none resize-none focus:ring-2 focus:ring-blue-500"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-gray-700 whitespace-pre-wrap dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200">
          {userData.address || "No address provided"}
        </div>
      )}
    </div>
  </div>
</div>

            {/* ADMIN CHECKBOX COMPONENT */}
            {isEditMode && isAdminEditingOthers && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50 mt-2">
                <input 
                  type="checkbox" 
                  id="adminCheck" 
                  checked={formData.isAdmin} 
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                  onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})} 
                />
                <label htmlFor="adminCheck" className="text-sm font-bold text-purple-800 dark:text-purple-300 cursor-pointer">
                  Assign Admin Role (Access to full management)
                </label>
              </div>
            )}

            {/* ACCOUNT STATUS SECTION */}
            {isEditMode && isAdminEditingOthers && (
              <div className="pt-4 border-t border-dashed dark:border-gray-700 space-y-2">
               <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Account Status</label>
               <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
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
                 <label htmlFor="statusToggle" className="font-bold text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                    Account is <span className={(formData?.status || 'active') === 'active' ? "text-green-600" : "text-red-600"}>
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
                 className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95"
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