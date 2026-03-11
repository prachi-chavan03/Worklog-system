import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, Calendar, 
  Edit, Eye, Send, Save as SaveIcon, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserHome = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const { adminViewUserId } = useParams(); 
const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const effectiveUserId = adminViewUserId || loggedInUser?.id;
  const isAdminMode = Boolean(adminViewUserId); 
  const [viewingUserName, setViewingUserName] = useState("");

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [logData, setLogData] = useState({});
  const [dbProjects, setDbProjects] = useState([]); 
  const [editingDate, setEditingDate] = useState(null); 
  const [persistedDates, setPersistedDates] = useState(new Set()); 
  const [viewData, setViewData] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]); // New state for dropdown

  const todayStr = new Date().toLocaleDateString('en-CA');
  const isWeekEditable = selectedWeek <= 1;
  
  // Add this to fetch the name of the user being viewed by admin
useEffect(() => {
  if (isAdminMode && adminViewUserId) {
    fetch(`${API_BASE_URL}/admin/users`)
      .then(res => res.json())
      .then(data => {
        // FIX: Look into data.users instead of just data
        if (data && Array.isArray(data.users)) {
          const viewedUser = data.users.find(u => u.id.toString() === adminViewUserId.toString());
          if (viewedUser) {
            setViewingUserName(viewedUser.full_name);
          } else {
            setViewingUserName("Unknown User");
          }
        }
      })
      .catch(err => {
        console.error("Error fetching viewed user name:", err);
        setViewingUserName("Error Loading Name");
      });
  }
}, [adminViewUserId, isAdminMode, API_BASE_URL]);

  useEffect(() => {
   const savedUser = JSON.parse(sessionStorage.getItem("user"));
  
  if (!savedUser) { navigate('/'); } else { setUser(savedUser); }
}, [navigate]);

  // FETCH EMPLOYEES: Targets your existing GET /api/admin/users route
  // FETCH EMPLOYEES: Targets your existing route and filters for 'employee' only
  useEffect(() => {
  fetch(`${API_BASE_URL}/admin/users`)
    .then(res => res.json())
    .then(data => {
      // 1. Access the 'users' array from the object your controller sends
      if (data && Array.isArray(data.users)) {
        
        // 2. Filter logic: 
        // - Must have an employee_id (not null or empty string)
        // - Should not be the person currently logged in
        const validEmployees = data.users.filter(emp => 
          emp.employee_id && 
          emp.employee_id !== "" && 
          emp.id !== loggedInUser?.id
        );

        setAllEmployees(validEmployees);
      }
    })
    .catch(err => console.error("Dropdown fetch error:", err));
}, [loggedInUser?.id]);
  
useEffect(() => {
    const fetchData = async () => {
      if (!effectiveUserId) return; 
      try {
  const projRes = await fetch(`${API_BASE_URL}/tasks/projects`);

        const projData = await projRes.json();
        if (projRes.ok) setDbProjects(projData);
const response = await fetch(`${API_BASE_URL}/tasks/get-logs/${effectiveUserId}`);
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          const formattedData = {};
          const savedDates = new Set();
          data.forEach(log => {
            const dateKey = new Date(log.work_date).toLocaleDateString('en-CA');
            formattedData[dateKey] = {
              day_type: log.day_type || "Working",
              project_name: log.project_name,
              module_name: log.module_name || "",
              task_description: log.task_description,
              hours_worked: log.hours_worked, 
              is_wfh: log.is_wfh === 1
            };
            savedDates.add(dateKey);
          });
          setLogData(formattedData);
          setPersistedDates(savedDates);
        }
      } catch (error) { console.error("Fetch error:", error); }
    };
    fetchData();
  }, [effectiveUserId, selectedWeek]);

  const handleLogout = () => {
    sessionStorage.clear();
  
  toast.success("Logged out successfully");
  navigate('/');
};

  const formatTimeInput = (date, value) => {
    if (!value) return;
    let cleanVal = value.toString().replace(/[^0-9]/g, '');
    let finalTime = "";
    if (cleanVal.length > 0) {
      let hours = 0; let mins = 0;
      if (cleanVal.length <= 2) {
        hours = parseInt(cleanVal); mins = 0;
      } else {
        let padded = cleanVal.padStart(4, '0');
        let rawHours = parseInt(padded.substring(0, 2));
        let rawMins = parseInt(padded.substring(2, 4));
        let totalMinutes = (rawHours * 60) + rawMins;
        hours = Math.floor(totalMinutes / 60);
        mins = totalMinutes % 60;
      }
      if (hours > 24) hours = 24;
      if (hours === 24) mins = 0;
      finalTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    if (finalTime === "00:00" || (cleanVal.length > 0 && parseInt(cleanVal) === 0)) {
      toast.error("Hours must be greater than 0");
      handleInputChange(date, 'hours_worked', "");
      return;
    }
    handleInputChange(date, 'hours_worked', finalTime);
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
        label: `${start.toLocaleDateString('en-GB')} To ${end.toLocaleDateString('en-GB')}`,
        days: Array.from({length: 7}, (_, idx) => {
          const d = new Date(start); d.setDate(start.getDate() + idx);
          const dbDate = d.toLocaleDateString('en-CA');
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          return { 
            name: dayName, date: d.toLocaleDateString('en-GB'), dbDate, 
            isFuture: dbDate > todayStr,
            isWeekOff: dayName === 'Saturday' || dayName === 'Sunday'
          };
        })
      });
    }
    return ranges;
  };

  const weekData = getWeekRanges();
  const currentDays = weekData[selectedWeek].days;

  const handleInputChange = (date, field, value) => {
    setLogData((prev) => {
      const updatedEntry = { ...prev[date], [field]: value };
      if (field === "day_type") {
        if (value !== "Working") {
          updatedEntry.project_name = "N/A";
          updatedEntry.module_name = "";
          updatedEntry.task_description = value;
          updatedEntry.hours_worked = "00:00";
          updatedEntry.is_wfh = false;
        } else {
          updatedEntry.project_name = ""; 
          updatedEntry.module_name = "";
          updatedEntry.task_description = ""; 
          updatedEntry.hours_worked = "";
          updatedEntry.is_wfh = false;
        }
      }
      return { ...prev, [date]: updatedEntry };
    });
  };

  const saveDay = async (day) => {
    const data = logData[day.dbDate];
    const dayType = data?.day_type || "Working";
    if (dayType === "Working") {
      if (!data?.project_name || !data?.task_description?.trim() || !data?.hours_worked || data.hours_worked === "00:00") {
        toast.error("Please fill all working details!"); return;
      }
      if (data.project_name === "Others" && !data.module_name?.trim()) {
        toast.error("Module Name is compulsory for 'Others' project"); return;
      }
    }
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/save-day`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: effectiveUserId, day_type: dayType, project_name: data.project_name,
          module_name: data.module_name || "", work_date: day.dbDate,
          hours_worked: data.hours_worked, task_description: data.task_description || "",
          is_wfh: !!data.is_wfh,
        }),
      });
      if (response.ok) {
        toast.success(`Entry saved!`);
        setPersistedDates((prev) => new Set(prev).add(day.dbDate));
        setEditingDate(null);
      }
    } catch (error) { toast.error("Server connection failed"); }
  };

  const submitWeeklySheet = async () => {
    const weekdays = currentDays.filter(day => !day.isWeekOff);
    const weeklyLogs = weekdays.map(day => {
      const data = logData[day.dbDate];
      return {
        work_date: day.dbDate, day_type: data?.day_type || "Working",
        project_name: data?.project_name || "", module_name: data?.module_name || "",
        task_description: data?.task_description || "", hours_worked: data?.hours_worked || "00:00",
        is_wfh: data?.is_wfh ? 1 : 0
      };
    });
    const incomplete = weeklyLogs.some(log => log.day_type === "Working" && (!log.project_name || log.hours_worked === "00:00"));
    if (incomplete) { toast.error("Please fill all weekdays before submitting!"); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/submit-weekly`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUserId, logs: weeklyLogs })
      });
      if (response.ok) {
        toast.success("Weekly timesheet submitted successfully!");
        const savedDates = new Set(persistedDates);
        weekdays.forEach(day => savedDates.add(day.dbDate));
        setPersistedDates(savedDates);
      } else { toast.error("Submission failed"); }
    } catch (error) { toast.error("Server connection lost"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* VIEW MODAL */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div><h3 className="text-lg font-bold text-gray-900">{viewData.name}</h3><p className="text-xs font-bold text-blue-600">{viewData.date}</p></div>
              <button onClick={() => setViewData(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</p><p className="text-sm font-bold text-gray-800">{logData[viewData.dbDate]?.project_name || "N/A"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module</p><p className="text-sm font-bold text-gray-800">{logData[viewData.dbDate]?.module_name || "N/A"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours Worked</p><p className="text-sm font-bold text-gray-800">{logData[viewData.dbDate]?.hours_worked || "00:00"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</p><p className="text-sm font-bold text-gray-800">{logData[viewData.dbDate]?.is_wfh ? "Work From Home" : "Office"}</p></div>
               </div>
               <div className="space-y-1 pt-2"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Description</p><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[100px]"><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{logData[viewData.dbDate]?.task_description || "No description provided."}</p></div></div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end"><button onClick={() => setViewData(null)} className="px-6 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl">Close</button></div>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-lg font-bold text-blue-600 leading-none">Hello, {user?.name || 'User'}, Welcome to Suchana Enterprises!!</h1>

        {/* DROPDOWN: Only for normal employees */}
        {loggedInUser?.role?.toLowerCase() === 'employee' && (
          <select 
            className="bg-gray-100 border-none text-xs font-bold p-2 rounded-lg outline-none cursor-pointer"
            onChange={(e) => { if(e.target.value) navigate(`/view-logs/${e.target.value}`); }}
          >
            <option value="">View Employees</option>
            {allEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.full_name}</option>
            ))}
          </select>
        )}

        <div className="flex gap-4">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 p-2 rounded-lg"><User size={18} /> Profile</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md"><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      {isAdminMode && (
  <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-4 flex justify-between items-center">
    <div>
      <p className="text-sm text-amber-700">
        Currently viewing <span className="font-bold">{viewingUserName}</span>'s worklogs
      </p>
    </div>
    <button 
      onClick={() => navigate('/admin-dashboard')} 
      className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 text-xs font-bold"
    >
      Back to Dashboard
    </button>
  </div>
)}

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {!isWeekEditable && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 shadow-sm">
            <Eye size={18} /><span className="text-sm font-bold">Viewing Archive: Editing is only allowed for the current and previous week.</span>
          </div>
        )}
        <div className="mb-4 bg-gray-900 text-white p-4 rounded-2xl shadow-sm"><h2 className="text-sm font-black uppercase tracking-[0.2em]">Weekly Task Entry</h2></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50/30">
            <Calendar className="text-blue-600" size={20} />
            <select className="w-full md:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))}>
              {weekData.map((range, idx) => (<option key={idx} value={idx}>{range.label}</option>))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[11px] font-black text-gray-400">
                <tr>
                  <th className="px-6 py-4">Day / Date</th><th className="px-6 py-4">Day Type</th><th className="px-6 py-4">Project Name</th><th className="px-6 py-4">Module Name</th><th className="px-6 py-4">Your Task</th><th className="px-6 py-4 text-center">Hours</th><th className="px-6 py-4 text-center">WFH</th><th className="px-6 py-4 text-center w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentDays.map((day, idx) => {
                  const isSaved = persistedDates.has(day.dbDate);
                  const isEditing = editingDate === day.dbDate;
                  const isDisabled = (isSaved && !isEditing) || day.isFuture || day.isWeekOff || !isWeekEditable;
                  const isDayOff = logData[day.dbDate]?.day_type && logData[day.dbDate]?.day_type !== "Working";
                  return (
                    <tr key={idx} className={`transition-colors ${day.isWeekOff ? 'bg-red-50/50' : 'hover:bg-blue-50/20'}`}>
                      <td className="px-6 py-4"><div className="font-bold text-gray-900">{day.name}</div><div className="text-[10px] font-bold text-gray-400">{day.date}</div></td>
                      {day.isWeekOff ? (<td colSpan="6" className="px-6 py-4 text-center"><span className="text-red-500 font-black uppercase tracking-widest text-xs">Week Off</span></td>) : (
                        <>
                          <td className="px-6 py-4">
                            <select className="bg-transparent border-none text-sm font-bold text-blue-600" value={logData[day.dbDate]?.day_type || "Working"} disabled={isDisabled} onChange={(e) => handleInputChange(day.dbDate, 'day_type', e.target.value)}>
                              <option value="Working">Working</option><option value="Leave">Leave</option><option value="Holiday">Holiday</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select className="w-full bg-transparent border-none text-sm font-medium" value={logData[day.dbDate]?.project_name || ""} disabled={isDisabled || isDayOff} onChange={(e) => handleInputChange(day.dbDate, 'project_name', e.target.value)}>
                              <option value="">Select Project</option>{dbProjects.map(p => <option key={p.id} value={p.project_name}>{p.project_name}</option>)}<option value="Others">Others</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input type="text" value={logData[day.dbDate]?.module_name || ""} disabled={isDisabled || isDayOff} placeholder={logData[day.dbDate]?.project_name === "Others" ? "REQUIRED*" : "Module"} className={`w-full bg-transparent border-b text-sm font-medium outline-none transition-all ${logData[day.dbDate]?.project_name === "Others" ? "border-blue-400" : "border-transparent"}`} onChange={(e) => handleInputChange(day.dbDate, 'module_name', e.target.value)} />
                          </td>
                          <td className="px-6 py-4">
                            <textarea value={logData[day.dbDate]?.task_description || ""} disabled={isDisabled || isDayOff} placeholder="Task description..." rows="1" className="w-full bg-transparent border-none text-sm py-1 resize-none" onChange={(e) => handleInputChange(day.dbDate, 'task_description', e.target.value)} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input type="text" value={logData[day.dbDate]?.hours_worked || ""} disabled={isDisabled || isDayOff} placeholder="HH:mm" className="w-16 bg-gray-100 border-none rounded-lg px-2 py-1 text-center text-xs font-bold" onChange={(e) => handleInputChange(day.dbDate, 'hours_worked', e.target.value)} onBlur={(e) => formatTimeInput(day.dbDate, e.target.value)} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={!!logData[day.dbDate]?.is_wfh} disabled={isDisabled || isDayOff} className="w-4 h-4 text-blue-600 rounded" onChange={(e) => handleInputChange(day.dbDate, 'is_wfh', e.target.checked)} />
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isWeekEditable && !day.isWeekOff && ((!isSaved || isEditing) ? (
                            <button onClick={() => saveDay(day)} disabled={day.isFuture} className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-[10px] font-bold"><SaveIcon size={12}/> {isEditing ? "Update" : "Save"}</button>
                          ) : (
                            <button onClick={() => setEditingDate(day.dbDate)} disabled={day.isFuture} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                          ))}
                          {!day.isWeekOff && (<button onClick={() => setViewData(day)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"><Eye size={16}/></button>)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isWeekEditable && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={submitWeeklySheet} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center gap-2"><Send size={18} /> Save & Submit Weekly Timesheet</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserHome;