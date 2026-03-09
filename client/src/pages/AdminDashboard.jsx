import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  UserPlus, LogOut, User, Eye,EyeOff, Trash2, 
  Users, Clock, ClipboardList, Menu, X, 
  Plus, Sun, Moon, Briefcase, ChevronDown, Mail, AlertCircle,
  CheckCircle, XCircle, Check// Added these for the status icons
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalUsersCount, setTotalUsersCount] = useState(0); // For the 'Total Users' stat card
  
  // Project State
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Pending Logs State
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isPendingDropdownOpen, setIsPendingDropdownOpen] = useState(false);
  const [selectedUserPending, setSelectedUserPending] = useState(null);

  const [resetRequests, setResetRequests] = useState([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetDropdownOpen, setIsResetDropdownOpen] = useState(false);
const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`http://localhost:5000/api/admin/users?page=${currentPage}&limit=7`);
        const userData = await userRes.json();

if (userRes.ok) {
  // IMPORTANT: Since backend now sends an object, we access userData.users
  setUsers(userData.users); 
  setTotalPages(userData.totalPages);
  setTotalUsersCount(userData.totalUsers);
}

        const projRes = await fetch('http://localhost:5000/api/tasks/projects');
        const projData = await projRes.json();
        if (projRes.ok) setProjects(projData);

        // Fetch pending logs summary
        const pendingRes = await fetch('http://localhost:5000/api/admin/pending-logs-summary');
        const pendingData = await pendingRes.json();
        if (pendingRes.ok) setPendingUsers(pendingData);

        // Fetch password reset requests
        const resetRes = await fetch('http://localhost:5000/api/admin/reset-requests');
        const resetData = await resetRes.json();
        if (resetRes.ok) setResetRequests(resetData);

      } catch (error) {
        toast.error("Failed to load dashboard data");
      }
    };
    fetchData();
  }, [currentPage]);

  const handleAddProject = async () => {
    if (!newProject.trim()) return toast.error("Project name required");
    try {
        const res = await fetch('http://localhost:5000/api/admin/add-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_name: newProject })
        });
        if (res.status === 409) return toast.error("This project already exists!");
        if (res.ok) {
            toast.success("Project added!");
            setNewProject("");
            setIsAddingProject(false);
            const projRes = await fetch('http://localhost:5000/api/tasks/projects');
            const projData = await projRes.json();
            if (projRes.ok) setProjects(projData);
        }
    } catch (err) {
        toast.error("Network error.");
    }
  };

  const handleInformUser = async (user) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/inform-user', {
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

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/');
  };
   
    //Resolve for reset pass req
    const handleResolveRequest = async (requestId) => {
  // This matches the /resolve-reset/:id route above
  const res = await fetch(`http://localhost:5000/api/admin/resolve-reset/${requestId}`, {
    method: 'PUT', // Must match the router method
  });
  
  if (res.ok) {
    toast.success("Request resolved");
    setResetRequests(prev => prev.filter(req => req.id !== requestId));
  }
};
  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen font-sans transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm`}>
        <h1 className="text-xl font-bold text-blue-600">Worklog <span className={darkMode ? 'text-white' : 'text-gray-900'}>Admin</span></h1>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {currentUser.employee_id && (
    <button 
      onClick={() => navigate('/user-home')} 
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md"
    >
      <ClipboardList size={18} /> My Daily Tasks
    </button>
  )}
          <button onClick={() => navigate('/profile')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-100'}`}>
            <User size={18} className="text-blue-600" /> Profile
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-md">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center`}>
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</p><p className="text-2xl font-black mt-1">{totalUsersCount}</p></div>
            <Users size={20} className="text-gray-300" />
          </div>
          {/* Reset Requests Dropdown Card */}
<div className="relative">
  <div 
    onClick={() => setIsResetDropdownOpen(!isResetDropdownOpen)}
    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-2xl shadow-sm border-l-4 border-red-500 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform`}
  >
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reset Requests</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-black mt-1">{resetRequests.length}</p>
        <ChevronDown size={16} className={`mt-1 transition-transform ${isResetDropdownOpen ? 'rotate-180' : ''}`} />
      </div>
    </div>
    <Mail size={20} className="text-red-500" />
  </div>

  {isResetDropdownOpen && (
    <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-xl border z-50 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      {resetRequests.length === 0 ? (
        <div className="p-4 text-xs font-bold text-center text-gray-400">No requests!</div>
      ) : (
        resetRequests.map(req => (
          <div 
            key={req.id}
            className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-0 transition-colors ${darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-red-50 border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold">{req.full_name || 'User'}</p>
                <p className="text-[10px] text-gray-400 truncate w-32">{req.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* TICKMARK BUTTON */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown from closing
                  handleResolveRequest(req.id);
                }}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Mark as Resolved"
              >
                <Check size={16} strokeWidth={3} />
              </button>

              
              {/* NAVIGATE BUTTON in Reset Requests Section */}
<button 
  onClick={(e) => {
    e.stopPropagation(); // Prevents the dropdown from closing
    if (req.user_id) {
      // Use the exact same path format as your working User Management table
      navigate(`/admin/edit-profile/:id/${req.user_id}`);
    } else {
      toast.error("User record not found in database");
    }
  }}
  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
  title="Edit User Profile"
>
  <User size={16} />
</button>
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>

          <div className="relative">
            <div 
              onClick={() => setIsPendingDropdownOpen(!isPendingDropdownOpen)}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-2xl shadow-sm border-l-4 border-amber-500 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform`}
            >
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Logs</p>
                <div className="flex items-center gap-2">
                    <p className="text-2xl font-black mt-1">{pendingUsers.length}</p>
                    <ChevronDown size={16} className={`mt-1 transition-transform ${isPendingDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <ClipboardList size={20} className="text-amber-500" />
            </div>

            {isPendingDropdownOpen && (
              <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-xl border z-50 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {pendingUsers.length === 0 ? (
                  <div className="p-4 text-xs font-bold text-center text-gray-400">All logs submitted!</div>
                ) : (
                  pendingUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => { setSelectedUserPending(u); setIsPendingDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold flex justify-between items-center transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-amber-50 text-gray-700'}`}
                    >
                      {u.full_name}
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{u.missing_count} Days</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {selectedUserPending && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black">{selectedUserPending.full_name}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase">Missing Logs (Current & Prev Week)</p>
                </div>
                <button onClick={() => setSelectedUserPending(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-6">
                  {selectedUserPending.missing_dates.map(date => (
                    <div key={date} className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-red-50 border-red-100'}`}>
                      <AlertCircle size={16} className="text-red-500" />
                      <span className="text-sm font-bold">{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleInformUser(selectedUserPending)}
                  className="w-full bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Mail size={18} /> Inform User via Email
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
              <button onClick={() => navigate('/add-user')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all">
                <UserPlus size={18} /> Add New User
              </button>
            </div>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border overflow-hidden`}>
              <table className="w-full text-left">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b border-gray-100`}>
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Sr.No</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">User Details</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <tr key={u.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50/20'}`}>
              <td className="px-6 py-4 text-sm font-bold text-gray-500">
        {(currentPage - 1) * 7 + (index + 1)}
      </td>
              
              <td className="px-6 py-4">
  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
    {u.full_name}
  </div>
  <div className="text-[10px] text-gray-400 flex items-center gap-1">
    {/* Only show EMP ID if it's not null and not 'NA' */}
    {u.employee_id && u.employee_id !== 'NA' && (
      <>
        <span>EMP ID: {u.employee_id}</span>
        <span className="text-gray-300">|</span>
      </>
    )}
    
    <span>{u.email}</span>
    <span className="text-gray-300">|</span>
    <span className="font-black text-blue-500 uppercase">{u.role}</span>
  </div>
</td>

                      {/* Status Column - Corrected the variable from users to u */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {u.status === 'active' ? (
                            <div className="flex items-center text-green-600 gap-1">
                              <CheckCircle size={18} />
                              <span className="font-bold text-xs uppercase">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 gap-1">
                              <XCircle size={18} />
                              <span className="font-bold text-xs uppercase">Inactive</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button 
  onClick={() => {
    // Only navigate if employee_id is NOT 'NA' and NOT null
    if (u.employee_id && u.employee_id !== 'NA') {
      navigate(`/admin/view-user/${u.id}`);
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

                          <button 
                            onClick={() => navigate(`/admin/edit-profile/:id/${u.id}`)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="User Profile"
                          >
                            <User size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={`flex justify-between items-center mt-6 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
  <button 
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(prev => prev - 1)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all hover:bg-blue-700"
  >
    Previous
  </button>

  <span className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
    Page {currentPage} of {totalPages}
  </span>

  <button 
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(prev => prev + 1)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all hover:bg-blue-700"
  >
    Next
  </button>
</div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className={`text-xl font-black mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <Briefcase size={20} className="text-blue-600" /> Project Hub
            </h2>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-5 rounded-2xl shadow-sm space-y-4`}>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Current Projects</label>
                <select className={`w-full p-3 rounded-xl border text-sm font-bold outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <option>View projects</option>
                  {projects.map((p, idx) => (<option key={idx} value={p.project_name}>{p.project_name}</option>))}
                </select>
              </div>
              {!isAddingProject ? (
                <button onClick={() => setIsAddingProject(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition-all"><Plus size={18} /> Add New Project</button>
              ) : (
                <div className="space-y-3 p-3 bg-blue-50/10 rounded-xl border border-blue-500/20">
                  <input type="text" placeholder="Enter project name..." className={`w-full p-3 rounded-xl border text-sm outline-none ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-200'}`} value={newProject} onChange={(e) => setNewProject(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleAddProject} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-xs">Add</button>
                    <button onClick={() => { setIsAddingProject(false); setNewProject(""); }} className="flex-1 bg-gray-200 text-gray-600 py-2.5 rounded-lg font-bold text-xs">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;