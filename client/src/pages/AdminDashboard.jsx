import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  UserPlus, LogOut, User, Eye, Trash2, ExternalLink, 
  Users, Clock, ClipboardList, Menu, X, 
  Plus, Sun, Moon, Briefcase 
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  
  // Project State
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Fetch Users and Projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('http://localhost:5000/api/admin/users');
        const userData = await userRes.json();
        if (userRes.ok) setUsers(userData);

        const projRes = await fetch('http://localhost:5000/api/tasks/projects');
        const projData = await projRes.json();
        if (projRes.ok) setProjects(projData);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      }
    };
    fetchData();
  }, []);
const handleAddProject = async () => {
    if (!newProject.trim()) return toast.error("Project name required");
    
    try {
        const res = await fetch('http://localhost:5000/api/admin/add-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_name: newProject })
        });

        if (res.status === 409) {
            return toast.error("This project already exists!");
        }

        if (res.ok) {
            toast.success("Project added!");
            setNewProject("");
            setIsAddingProject(false);
            
            // Re-fetch to sync the list
            const projRes = await fetch('http://localhost:5000/api/tasks/projects');
            const projData = await projRes.json();
            if (projRes.ok) setProjects(projData);
        }
    } catch (err) {
        toast.error("Network error. Is the server running?");
    }
};
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen font-sans transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm`}>
        <h1 className="text-xl font-bold text-blue-600">Worklog <span className={darkMode ? 'text-white' : 'text-gray-900'}>Admin</span></h1>
        
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={() => navigate('/profile')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <User size={18} className="text-blue-600" /> Profile
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-md shadow-red-100">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats Grid - Removed Active Users */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: <Users size={20} />, color: "border-blue-500" },
            { label: "Total Hours", value: "480", icon: <Clock size={20} />, color: "border-emerald-500" },
            { label: "Pending Logs", value: "03", icon: <ClipboardList size={20} />, color: "border-amber-500" },
          ].map((card, idx) => (
            <div key={idx} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-2xl shadow-sm border-l-4 ${card.color} flex justify-between items-center`}>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                <p className={`text-2xl font-black mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
              </div>
              <div className="text-gray-300">{card.icon}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Management */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
              <button onClick={() => navigate('/add-user')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95">
                <UserPlus size={18} /> Add New User
              </button>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border overflow-hidden`}>
              <table className="w-full text-left">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b border-gray-100`}>
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Sr.No</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">User Details</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <tr key={u.id} className={`flex flex-col md:table-row p-4 md:p-0 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50/20'}`}>
                      <td className="md:px-6 md:py-4 text-sm font-bold text-gray-400">#{index + 1}</td>
                      <td className="md:px-6 md:py-4">
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.full_name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          <span className={`${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'} px-1.5 py-0.5 rounded font-black uppercase`}>
                            {u.employee_id ? `EMP ID: ${u.employee_id}` : u.role}
                          </span>
                          <span className="text-gray-400 italic">({u.email})</span>
                        </div>
                      </td>
                      <td className="md:px-6 md:py-4">
                        <div className="flex flex-wrap md:justify-center items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18}/></button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          <button 
  onClick={() => navigate(`/admin/view-user/${u.id}`)} 
  className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
>
  <Eye size={16} /> View
</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Project Hub (New) */}
          <div className="lg:col-span-1">
            <h2 className={`text-xl font-black mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <Briefcase size={20} className="text-blue-600" /> Project Hub
            </h2>
            
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-5 rounded-2xl shadow-sm space-y-4`}>
              {/* Existing Projects Dropdown */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Current Projects</label>
                <select className={`w-full p-3 rounded-xl border text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
                  <option>View projects</option>
                  {projects.map((p, idx) => (
                    <option key={idx} value={p.project_name}>{p.project_name}</option>
                  ))}
                </select>
              </div>

              {/* Add Project Section */}
              {!isAddingProject ? (
                <button 
                  onClick={() => setIsAddingProject(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                  <Plus size={18} /> Add New Project
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-blue-50/10 rounded-xl border border-blue-500/20 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    placeholder="Enter project name..."
                    className={`w-full p-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-200'}`}
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddProject}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-xs transition-all"
                    >
                      Add Project
                    </button>
                    <button 
                      onClick={() => { setIsAddingProject(false); setNewProject(""); }}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-xs ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                      Cancel
                    </button>
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