import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  UserPlus, LogOut, User, Eye, Edit, Trash2, ExternalLink, 
  Users, Clock, ClipboardList, Bell, Menu, X, CheckCircle, AlertTriangle 
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch real users from DB
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/users');
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        }
      } catch (error) {
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">Worklog <span className="text-gray-900">Admin</span></h1>
        
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
            <User size={18} className="text-blue-600" /> Profile
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-md shadow-red-100">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-3 shadow-lg">
          <button onClick={() => { setIsMenuOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-3 p-3 text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-all">
            <User size={20} className="text-blue-600" /> Profile
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 font-semibold hover:bg-red-50 rounded-xl">
            <LogOut size={20} /> Logout
          </button>
        </div>
      )}

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: <Users size={20} />, color: "border-blue-500" },
            { label: "Total Hours", value: "480", icon: <Clock size={20} />, color: "border-emerald-500" },
            { label: "Pending Logs", value: "03", icon: <ClipboardList size={20} />, color: "border-amber-500" },
            { label: "Active Users", value: "08", icon: <CheckCircle size={20} />, color: "border-purple-500" },
          ].map((card, idx) => (
            <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${card.color} flex justify-between items-center`}>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className="text-gray-300">{card.icon}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-black text-gray-800">User Management</h2>
              <button onClick={() => navigate('/add-user')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95">
                <UserPlus size={18} /> Add New User
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Sr.No</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">User Details</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <tr key={u.id} className="flex flex-col md:table-row p-4 md:p-0 hover:bg-blue-50/20 transition-colors">
                      <td className="md:px-6 md:py-4 text-sm font-bold text-gray-400">#{index + 1}</td>
                      <td className="md:px-6 md:py-4">
                        <div className="font-bold text-gray-900">{u.full_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {u.employee_id ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">
                              EMP ID: {u.employee_id}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-black uppercase">
                              {u.role}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 italic">({u.email})</span>
                        </div>
                      </td>
                      <td className="md:px-6 md:py-4">
                        <div className="flex flex-wrap md:justify-center items-center gap-2">
                          <button className="p-2 text-blue-600"><Eye size={18}/></button>
                          <button className="p-2 text-amber-600"><Edit size={18}/></button>
                          <button className="p-2 text-red-600"><Trash2 size={18}/></button>
                          <button className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-gray-600 bg-gray-50 rounded-md border">
                            <ExternalLink size={12} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Bell size={20} className="text-blue-600" /> Alerts
            </h2>
            <div className="space-y-3">
              <div className="bg-white border-l-4 border-amber-400 p-4 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">Warning</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <p className="text-sm text-gray-700 font-medium">3 users missing logs</p>
                </div>
              </div>
              <div className="bg-white border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-red-600 uppercase mb-1">Critical</p>
                <p className="text-sm text-gray-700 font-medium">Maintenance at 12AM</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;