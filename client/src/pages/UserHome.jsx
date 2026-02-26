import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Calendar, Menu, X, 
  Edit, Eye, Trash2, Send, Save as SaveIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserHome = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      navigate('/');
    } else {
      setUser(savedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const getWeekRanges = () => {
    const ranges = [];
    const now = new Date();
    for (let i = 0; i < 8; i++) {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1) - (i * 7);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      ranges.push({
        // Removed "Running Week" labels, showing only Date Range
        label: `${start.toLocaleDateString('en-GB')} To ${end.toLocaleDateString('en-GB')}`,
        days: Array.from({length: 7}, (_, idx) => {
          const d = new Date(start);
          d.setDate(start.getDate() + idx);
          return {
            name: d.toLocaleDateString('en-US', { weekday: 'long' }),
            date: d.toLocaleDateString('en-GB')
          };
        })
      });
    }
    return ranges;
  };

  const weekData = getWeekRanges();
  const currentDays = weekData[selectedWeek].days;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">Worklog <span className="text-gray-900">User</span></h1>
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

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Calendar className="text-blue-600" size={20} />
              <select 
                className="w-full md:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              >
                {weekData.map((range, idx) => (
                  <option key={idx} value={idx}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Day / Date</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Project Name</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Your Task</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Hours</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">WFH</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentDays.map((day, idx) => (
                  <tr key={idx} className={`hover:bg-blue-50/20 transition-colors ${day.name === 'Saturday' || day.name === 'Sunday' ? 'bg-red-50/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{day.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 tracking-wider">{day.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" placeholder="Project Name" className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium" />
                    </td>
                    <td className="px-6 py-4">
                      <textarea placeholder="Description..." rows="1" className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 resize-none" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input type="number" step="0.5" placeholder="0" className="w-14 bg-gray-100 border-none rounded-lg px-2 py-1 text-center text-xs font-bold" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* Clearer Save Button for Users */}
                        <button className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-all">
                           <SaveIcon size={12}/> Save
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"><Eye size={16}/></button>
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Logic: Only show submit for running week (0) and last week (1) */}
          {(selectedWeek === 0 || selectedWeek === 1) && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2">
                <Send size={18} /> Save & Submit Weekly Timesheet
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserHome;