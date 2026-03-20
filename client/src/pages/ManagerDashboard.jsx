import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye,EyeOff, User, Users, Briefcase, LogOut, UserCircle, Filter ,Sun, Moon,ClipboardList, ChevronDown, X, AlertCircle, Mail } from 'lucide-react';

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

const [pendingUsers, setPendingUsers] = useState([]);
const [isPendingDropdownOpen, setIsPendingDropdownOpen] = useState(false);
const [selectedUserPending, setSelectedUserPending] = useState(null);

const [isDarkMode, setIsDarkMode] = useState(
  localStorage.getItem('theme') === 'dark' || 
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
);

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}, [isDarkMode]);

const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

useEffect(() => {
  // Sync with sessionStorage
  const savedUser = JSON.parse(sessionStorage.getItem('user'));
  setCurrentUser(savedUser);

  const fetchData = async () => {
    try {
      // Pagination and Projects fetch
      const [uRes, pRes ,pendingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users?page=${currentPage}&limit=7`),
        fetch(`${API_BASE_URL}/tasks/projects`),
        fetch(`${API_BASE_URL}/admin/pending-logs-summary`)
      ]);

      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotalPages(data.totalPages || 1);
        setTotalUsersCount(data.totalUsers || 0);
      }

      if (pRes.ok) {
        const projectData = await pRes.json();
        setProjects(Array.isArray(projectData) ? projectData : []);
      }
      // Handle Pending Logs data
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingUsers(pendingData);
      }
    } catch (error) {
      toast.error("Failed to load data");
    }
  };
  
  fetchData();
}, [currentPage, API_BASE_URL]); // Dependencies are clean

const displayUsers = Array.isArray(users) 
  ? (showOnlyEmployees 
      ? users.filter(u => u.employee_id && u.employee_id !== 'NA') // Change: Check for ID, not role
      : users)
  : [];

  const handleInformUser = async (user) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/inform-user`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id, 
        email: user.email, 
        pendingDates: user.missing_dates 
      })
    });
    if (res.ok) toast.success(`Notification sent to ${user.full_name}`);
  } catch (err) {
    toast.error("Failed to send email");
  }
};

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-300">
      
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 ">
          Vivan Systems <span className="text-slate-900 dark:text-white">Manager</span>
        </h1>
        
        <div className="flex items-center gap-6">
          {/* DARK MODE TOGGLE BUTTON */}
    <button
      onClick={toggleDarkMode}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
          <div 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser?.full_name || 'Manager'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium dark:text-white">View My Account</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <UserCircle size={24} />
            </div>
          </div>

         
<button 
  onClick={() => { sessionStorage.clear(); navigate('/'); }} 
  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
>
  <LogOut size={18} /> Logout
</button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-4xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest dark:text-white">Displaying Users</p>
              <p className="text-3xl font-black mt-1 dark:text-white">{totalUsersCount}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-4xl shadow-sm border border-slate-200 dark:bg-slate-900 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest dark:text-white">Active Projects</p>
              <p className="text-3xl font-black mt-1">{projects.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Briefcase size={24} />
            </div>
          </div>

         {/* Pending Logs Dropdown Card */}
<div className="relative">
  <div 
    onClick={() => setIsPendingDropdownOpen(!isPendingDropdownOpen)}
    className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform"
  >
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest dark:text-slate-400">Pending Logs</p>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-black mt-1 ">{pendingUsers.length}</p>
        <ChevronDown size={18} className={`mt-2 transition-transform ${isPendingDropdownOpen ? 'rotate-180' : ''}`} />
      </div>
    </div>
    <div className="p-3 bg-amber-50 rounded-2xl  text-amber-600 dark:bg-amber-900/20">
      <ClipboardList size={24} />
    </div>
  </div>

  {isPendingDropdownOpen && (
    <div className="absolute top-full left-0 w-full mt-2 dark:bg-slate-900 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
      {pendingUsers.length === 0 ? (
        <div className="p-4 text-xs font-bold text-center text-slate-400">All logs submitted!</div>
      ) : (
        pendingUsers.map(u => (
          <button 
            key={u.id}
            onClick={() => { setSelectedUserPending(u); setIsPendingDropdownOpen(false); }}
className="w-full text-left px-5 py-4 text-sm font-bold flex justify-between items-center hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-800"
                    >
            <span className="text-slate-700 dark:text-white ">{u.full_name}</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded-lg font-black">{u.missing_count} Days</span>
          </button>
        ))
      )}
    </div>
  )}
</div>

        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* --- TOGGLE SECTION --- */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-700 dark:text-white ">User Directory</h2>
              
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold  text-slate-500 uppercase tracking-tight dark:text-white">Show Employees Only</span>
                <button 
                  onClick={() => setShowOnlyEmployees(!showOnlyEmployees)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${showOnlyEmployees ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showOnlyEmployees ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-white uppercase text-center w-20">No.</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-white uppercase">User Details</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-white uppercase text-center">Role</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-white uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayUsers.map((u, index) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400 text-center dark:text-white">{(currentPage - 1) * 7 + (index + 1)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors dark:text-white">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-medium dark:text-white">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${u.role === 'employee' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100  text-slate-500'}`}>
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
<div className="flex justify-between items-center mt-6 px-6 py-4 bg-slate-50 border-t border-slate-100 dark:bg-slate-900">
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
            <h2 className="text-xl font-black mb-6 text-slate-700 dark:text-white">Project List</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-200 shadow-sm">
              <ul className="space-y-3">
                {projects.map((p, idx) => (
                  <li key={idx} className="p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 dark:text-white dark:bg-slate-900 border border-transparent hover:border-blue-500/50 transition-all">
                    {p.project_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

{/* Missing Logs Detail Modal */}
{/* Missing Logs Detail Modal */}
{selectedUserPending && (
  /* Darkened backdrop with blur to match the professional look */
  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-60 flex items-center justify-center p-4">
    
    {/* Change: Updated dark background to #1e293b and added subtle border */}
    <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-transparent dark:border-slate-800">
      
      {/* Change: Header border color darkened for dark mode */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">
            {selectedUserPending.full_name}
          </h3>
          {/* Change: Updated label text and blue color tone */}
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
            Missing Logs (Current & Prev Week)
          </p>
        </div>
        <button 
          onClick={() => setSelectedUserPending(null)} 
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-8">
        {/* Change: Increased max-height and spacing between items */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-8 custom-scrollbar">
          {selectedUserPending.missing_dates.map(date => (
            /* Change: Removed red background. 
               Used deep navy (#0f172a) with dark border for the "row" look. */
            <div 
              key={date} 
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0f172a]/60 border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-500/50"
            >
              {/* Change: Icon sits in a subtle red circular badge */}
              <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle size={14} className="text-red-500" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))}
        </div>

        {/* Change: Updated button background to match the darkest UI elements (#0f172a) */}
        <button 
          onClick={() => handleInformUser(selectedUserPending)}
          className="w-full bg-slate-900 dark:bg-[#0f172a] hover:bg-blue-600 dark:hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 border border-transparent dark:border-slate-800"
        >
          <Mail size={18} /> Inform User via Email
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ManagerDashboard;