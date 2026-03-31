import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Shield, 
  Phone, GraduationCap, Calendar, Wrench, MapPin, CalendarDays 
} from 'lucide-react';

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [employee, setEmployee] = useState(null);

  // --- DARK MODE SYNC LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  // ----------------------------

  useEffect(() => {
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

  if (!employee) return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
      <div className="text-gray-400 font-bold animate-pulse">Loading profile...</div>
    </div>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Provided";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-3xl mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 font-bold transition-all">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12 transition-colors">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white">{employee.full_name}</h1>
            <p className="text-blue-500 dark:text-blue-400 text-xs font-black uppercase tracking-widest mt-1">
              {employee.role} • {employee.designation || "No Designation"}
            </p>
          </div>
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
            employee.status === 'active' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-600'
          }`}>
            {employee.status || 'Active'}
          </div>
        </div>

        <div className="space-y-8">
          {/* Primary Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoBlock label="Email Address" value={employee.email} icon={<Mail size={18} />} />
            <InfoBlock label="Mobile Number" value={employee.mobile} icon={<Phone size={18} />} />
            <InfoBlock label="Education" value={employee.education} icon={<GraduationCap size={18} />} />
            <InfoBlock label="Account Role" value={employee.role} icon={<Shield size={18} />} className="capitalize" />
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-slate-800">
            <InfoBlock label="Date of Birth" value={formatDate(employee.dob)} icon={<CalendarDays size={18} />} />
            <InfoBlock label="Date of Joining" value={formatDate(employee.date_of_joining)} icon={<Calendar size={18} />} />
          </div>

          {/* Full Width Section */}
          <div className="space-y-6 pt-4 border-t border-gray-50 dark:border-slate-800">
            <InfoBlock label="Skills" value={employee.skills || "No skills listed"} icon={<Wrench size={18} />} />
            <InfoBlock label="Residential Address" value={employee.address || "No address provided"} icon={<MapPin size={18} />} isTextArea />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-component
const InfoBlock = ({ label, value, icon, className = "", isTextArea = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">{label}</label>
    <div className={`flex items-start gap-3 p-4 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl border border-gray-50 dark:border-slate-800 text-[#334155] dark:text-slate-200 font-semibold transition-colors ${className}`}>
      <span className="mt-0.5 text-blue-500 dark:text-blue-400">{icon}</span>
      <div className={isTextArea ? "whitespace-pre-wrap leading-relaxed" : ""}>
        {value || "Not Provided"}
      </div>
    </div>
  </div>
);

export default ViewProfile;