import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye,EyeOff, User, Users, Briefcase, LogOut, UserCircle, Filter } from 'lucide-react';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalUsersCount, setTotalUsersCount] = useState(0);
const [showOnlyEmployees, setShowOnlyEmployees] = useState(false);



useEffect(() => {
  const savedUser = JSON.parse(localStorage.getItem('user'));
  setCurrentUser(savedUser);

  const fetchData = async () => {
    try {
      // Add pagination params to the URL
      const [uRes, pRes] = await Promise.all([
       fetch(`${API_BASE_URL}/admin/users?page=${currentPage}&limit=7`),
      fetch(`${API_BASE_URL}/tasks/projects`)
      ]);

      if (uRes.ok) {
        const data = await uRes.json();
        // Extract from the object just like in AdminDash
        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotalPages(data.totalPages || 1);
        setTotalUsersCount(data.totalUsers || 0);
      }
      // ... rest of your project fetch logic
    } catch (error) {
      toast.error("Failed to load data");
    }
  };
  fetchData();
}, [currentPage]); // Re-run when page changes
  
  // NEW STATE: For the employee toggle
  
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(savedUser);
const fetchData = async () => {
  try {
    const [uRes, pRes] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/users`),
    fetch(`${API_BASE_URL}/tasks/projects`)
    ]);

    if (uRes.ok) {
      const data = await uRes.json();
      console.log("Data from backend:", data);

      // CHANGE THIS LINE: 
      // Instead of setUsers(data), use:
      setUsers(Array.isArray(data.users) ? data.users : []);
    }

    if (pRes.ok) {
      const projectData = await pRes.json();
      setProjects(Array.isArray(projectData) ? projectData : []);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Failed to load data");
  }
};
    fetchData();
  }, []);

const displayUsers = Array.isArray(users) 
  ? (showOnlyEmployees 
      ? users.filter(u => u.employee_id && u.employee_id !== 'NA') // Change: Check for ID, not role
      : users)
  : [];

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen font-sans">
      
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">
          Worklog <span className="text-slate-900">Manager</span>
        </h1>
        
        <div className="flex items-center gap-6">
          <div 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.full_name || 'Manager'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">View My Account</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <UserCircle size={24} />
            </div>
          </div>

          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }} 
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Displaying Users</p>
              <p className="text-3xl font-black mt-1">{totalUsersCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Projects</p>
              <p className="text-3xl font-black mt-1">{projects.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Briefcase size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* --- TOGGLE SECTION --- */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-700">User Directory</h2>
              
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Show Employees Only</span>
                <button 
                  onClick={() => setShowOnlyEmployees(!showOnlyEmployees)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${showOnlyEmployees ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showOnlyEmployees ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-center w-20">No.</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">User Details</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-center">Role</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayUsers.map((u, index) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400 text-center">{(currentPage - 1) * 7 + (index + 1)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${u.role === 'employee' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-3">
                                              <button 
  onClick={() => {
    // Only navigate if employee_id is NOT 'NA' and NOT null
    if (u.employee_id && u.employee_id !== 'NA') {
      navigate(`/view-logs/${u.id}`);
    }
  }} 
  disabled={!u.employee_id || u.employee_id === 'NA'} // Disables the button logic
  className={`p-2 rounded-full transition-colors ${
    !u.employee_id || u.employee_id === 'NA' 
      ? "text-gray-300 cursor-not-allowed" // Style for "not workable"
      : "text-blue-600 hover:bg-blue-50"    // Normal style
  }`}
  title={!u.employee_id || u.employee_id === 'NA' ? "For Employee Only" : "View Details"}
>
  {/* If ID is NA or missing, show EyeOff (closed eye), else show regular Eye */}
  {(!u.employee_id || u.employee_id === 'NA') ? (
    <EyeOff size={18} />
  ) : (
    <Eye size={18} />
  )}
</button>
                        <button onClick={() => navigate(`/view-profile/${u.id}`)} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl" title="View Profile"><User size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* Pagination Controls */}
<div className="flex justify-between items-center mt-6 px-6 py-4 bg-slate-50 border-t border-slate-100">
  <button 
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(prev => prev - 1)}
    className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all hover:bg-blue-700 shadow-md"
  >
    Previous
  </button>

  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
    Page {currentPage} of {totalPages}
  </span>

  <button 
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(prev => prev + 1)}
    className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all hover:bg-blue-700 shadow-md"
  >
    Next
  </button>
</div>
          </div>



          <div className="lg:col-span-1">
            <h2 className="text-xl font-black mb-6 text-slate-700">Project List</h2>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <ul className="space-y-3">
                {projects.map((p, idx) => (
                  <li key={idx} className="p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-transparent hover:border-blue-500/50 transition-all">
                    {p.project_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;