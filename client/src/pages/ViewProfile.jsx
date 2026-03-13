import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Briefcase, Shield, 
  Phone, GraduationCap, Cake, Calendar, Wrench, MapPin ,CalendarDays 
} from 'lucide-react';

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem('user');
    if (!session) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        // Ensure your backend endpoint /admin/users/:id now includes the new columns in the SELECT query
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

  // Helper function to format date from DB to readable string
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Provided";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold transition-all">
                  <ArrowLeft size={20} /> Back to Dashboard
                </button>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b]">{employee.full_name}</h1>
            <p className="text-blue-500 text-xs font-black uppercase tracking-widest mt-1">
              {employee.role} • {employee.designation || "No Designation"}
            </p>
          </div>
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${employee.status === 'active' ? 'bg-green-100 text-red-600' : 'bg-red-100 text-green-600'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            <InfoBlock label="Date of Birth" value={formatDate(employee.dob)} icon={<CalendarDays  size={18} />} />
            <InfoBlock label="Date of Joining" value={formatDate(employee.date_of_joining)} icon={<Calendar size={18} />} />
          </div>

          {/* Full Width Section */}
          <div className="space-y-6 pt-4 border-t border-gray-50">
            <InfoBlock label="Skills" value={employee.skills || "No skills listed"} icon={<Wrench size={18} />} />
            <InfoBlock label="Residential Address" value={employee.address || "No address provided"} icon={<MapPin size={18} />} isTextArea />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-component for clean code
const InfoBlock = ({ label, value, icon, className = "", isTextArea = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{label}</label>
    <div className={`flex items-start gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-gray-50 text-[#334155] font-semibold ${className}`}>
      <span className="mt-0.5 text-blue-500">{icon}</span>
      <div className={isTextArea ? "whitespace-pre-wrap leading-relaxed" : ""}>
        {value || "Not Provided"}
      </div>
    </div>
  </div>
);

export default ViewProfile;