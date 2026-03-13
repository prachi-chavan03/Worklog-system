import { useParams, useNavigate ,useLocation} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, Calendar, 
  Edit, Eye, Send, Save as SaveIcon, X ,ArrowLeft,
  Sun, Moon, Check // Added for dark mode icons
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminViewUserId } = useParams(); 
  const isFromAdmin = location.state?.fromAdmin;
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const effectiveUserId = adminViewUserId || loggedInUser?.id;
  const isAdminMode = Boolean(adminViewUserId); 
  const [viewingUserName, setViewingUserName] = useState("");

  // --- DARK MODE STATE & LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

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
  // -------------------------------

  const [user, setUser] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [logData, setLogData] = useState({});
  const [dbProjects, setDbProjects] = useState([]); 
  const [editingDate, setEditingDate] = useState(null); 
  const [persistedDates, setPersistedDates] = useState(new Set()); 
  const [viewData, setViewData] = useState(null);
  

  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const todayStr = new Date().toLocaleDateString('en-CA');
  const isWeekEditable = selectedWeek <= 1;
  
  useEffect(() => {
  if (isAdminMode && adminViewUserId) {
    fetch(`${API_BASE_URL}/admin/users`)
      .then(res => res.json())
      .then(data => {
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
  }, [effectiveUserId, selectedWeek,customStartDate, customEndDate, isCustomRange, API_BASE_URL]);

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
  
  const getDisplayDays = () => {
    if (isCustomRange && customStartDate && customEndDate) {
      const days = [];
      let start = new Date(customStartDate);
      let end = new Date(customEndDate);
      if (end < start) return [];
      let current = new Date(start);
      let safetyCount = 0; 
      while (current <= end && safetyCount < 31) {
        const dbDate = current.toLocaleDateString('en-CA');
        const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
        days.push({
          name: dayName,
          date: current.toLocaleDateString('en-GB'),
          dbDate,
          isFuture: dbDate > todayStr,
          isWeekOff: dayName === 'Saturday' || dayName === 'Sunday'
        });
        current.setDate(current.getDate() + 1);
        safetyCount++;
      }
      return days;
    }
    return weekData[selectedWeek]?.days || [];
  };

  const currentDays = getDisplayDays();

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* VIEW MODAL */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewData.name}</h3><p className="text-xs font-bold text-blue-600 dark:text-blue-400">{viewData.date}</p></div>
              <button onClick={() => setViewData(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} className="text-gray-500 dark:text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.project_name || "N/A"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.module_name || "N/A"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours Worked</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.hours_worked || "00:00"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.is_wfh ? "Work From Home" : "Office"}</p></div>
               </div>
               <div className="space-y-1 pt-2"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Description</p><div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 min-h-[100px]"><p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{logData[viewData.dbDate]?.task_description || "No description provided."}</p></div></div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800 flex justify-end"><button onClick={() => setViewData(null)} className="px-6 py-2 bg-gray-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl">Close</button></div>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-none">Hello, {user?.name || 'User'}, Welcome to Suchana Enterprises!!</h1>


        <div className="flex gap-4 items-center">
          {/* DARK MODE TOGGLE: Hidden for Admin, Visible for Employee */}
          {!isAdminMode && (
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:ring-2 ring-blue-400 transition-all"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-lg"><User size={18} /> Profile</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md"><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      {isAdminMode && (
  <div className="bg-amber-100 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-4 flex justify-between items-center">
    <div>
      <p className="text-sm text-amber-700 dark:text-amber-400">
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
        {/* 🚀 ADD THIS SECTION: BACK TO ADMIN BUTTON */}
  {isFromAdmin && (
    <button 
      onClick={() => navigate('/admin-dashboard')}
      className="flex items-center gap-2 mb-6 px-4 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-50 dark:hover:bg-slate-800 transition-all active:scale-95"
    >
      <ArrowLeft size={18} />
      Back to Admin Dashboard
    </button>
  )}
        {!isWeekEditable && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-500 shadow-sm">
            <Eye size={18} /><span className="text-sm font-bold">Viewing Archive: Editing is only allowed for the current and previous week.</span>
          </div>
        )}
        <div className="mb-4 bg-gray-900 dark:bg-blue-600 text-white p-4 rounded-2xl shadow-sm"><h2 className="text-sm font-black uppercase tracking-[0.2em]">Weekly Task Entry</h2></div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">


         <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-4 bg-gray-50/30 dark:bg-slate-800/30">
  <div className="flex items-center gap-2">
    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
    {!isCustomRange ? (
      <select 
        className="w-full md:w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold outline-none dark:text-white" 
        value={selectedWeek} 
        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
      >
        {weekData.map((range, idx) => (<option key={idx} value={idx}>{range.label}</option>))}
      </select>
    ) : (
      <div className="flex items-center gap-2">
        <input 
          type="date" 
          className="border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1 text-sm font-bold dark:text-white"
          value={customStartDate}
          onChange={(e) => setCustomStartDate(e.target.value)}
        />
        <span className="text-xs font-bold text-gray-400">TO</span>
        <input 
          type="date" 
          className="border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1 text-sm font-bold dark:text-white"
          value={customEndDate}
          onChange={(e) => setCustomEndDate(e.target.value)}
        />
      </div>
    )}
  </div>

  <div className="flex gap-2">
    {/* Toggle Button */}
    <button 
      onClick={() => setIsCustomRange(!isCustomRange)}
      className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50"
    >
      {isCustomRange ? "Standard Weeks" : "Custom Range"}
    </button>

    {/* Sync Button: Resets to Current Week */}
    <button 
      onClick={() => {
        setIsCustomRange(false);
        setSelectedWeek(0);
        setCustomStartDate("");
        setCustomEndDate("");
        toast.success("Synced to current week");
      }}
      className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-lg transition-colors"
      title="Sync to Default"
    >
      <svg xmlns="http://www.w3.org/2000/svg" size={16} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
    </button>
  </div>
</div>


          <div className="overflow-x-auto">
            <table className="w-full text-left">

             <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 uppercase text-[11px] font-black text-gray-400 dark:text-slate-500">
  <tr>
    <th className="px-6 py-4 w-[12%]">Day / Date</th>
    <th className="px-6 py-4 w-[10%]">Day Type</th>
    <th className="px-6 py-4 w-[15%]">Project Name</th>
    <th className="px-6 py-4 w-[13%]">Module Name</th> {/* Reduced from default */}
    <th className="px-6 py-4 w-[30%]">Your Task</th>   {/* Increased significantly */}
    <th className="px-6 py-4 text-center w-[8%]">Hours</th>
    <th className="px-6 py-4 text-center w-[4%]">WFH</th>
    <th className="px-6 py-4 text-center w-[8%]">Actions</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {currentDays.map((day, idx) => {
                  const isSaved = persistedDates.has(day.dbDate);
                  const isEditing = editingDate === day.dbDate;
                  const isDisabled = (isSaved && !isEditing) || day.isFuture || day.isWeekOff || !isWeekEditable;
                  const isDayOff = logData[day.dbDate]?.day_type && logData[day.dbDate]?.day_type !== "Working";
                  return (
                    <tr key={idx} className={`transition-colors ${day.isWeekOff ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-blue-50/20 dark:hover:bg-blue-900/10'}`}>
                      <td className="px-6 py-4"><div className="font-bold text-gray-900 dark:text-slate-200">{day.name}</div><div className="text-[10px] font-bold text-gray-400">{day.date}</div></td>
                      {day.isWeekOff ? (<td colSpan="6" className="px-6 py-4 text-center"><span className="text-red-500 font-black uppercase tracking-widest text-xs">Week Off</span></td>) : (
                        <>
                          <td className="px-6 py-4">
                            <select className="bg-transparent border-none text-sm font-bold text-blue-600 dark:text-blue-400 outline-none" value={logData[day.dbDate]?.day_type || "Working"} disabled={isDisabled} onChange={(e) => handleInputChange(day.dbDate, 'day_type', e.target.value)}>
                              <option value="Working" className="dark:bg-slate-900">Working</option><option value="Leave" className="dark:bg-slate-900">Leave</option><option value="Holiday" className="dark:bg-slate-900">Holiday</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select className="w-full bg-transparent border-none text-sm font-medium dark:text-slate-200 outline-none" value={logData[day.dbDate]?.project_name || ""} disabled={isDisabled || isDayOff} onChange={(e) => handleInputChange(day.dbDate, 'project_name', e.target.value)}>
                              <option value="" className="dark:bg-slate-900">Select Project</option>{dbProjects.map(p => <option key={p.id} value={p.project_name} className="dark:bg-slate-900">{p.project_name}</option>)}<option value="Others" className="dark:bg-slate-900">Others</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input type="text" value={logData[day.dbDate]?.module_name || ""} disabled={isDisabled || isDayOff} placeholder={logData[day.dbDate]?.project_name === "Others" ? "REQUIRED*" : "Module"} className={`w-full bg-transparent border-b text-sm font-medium outline-none transition-all dark:text-slate-200 ${logData[day.dbDate]?.project_name === "Others" ? "border-blue-400" : "border-transparent"}`} onChange={(e) => handleInputChange(day.dbDate, 'module_name', e.target.value)} />
                          </td>
                          <td className="px-6 py-4">
                            <textarea value={logData[day.dbDate]?.task_description || ""} disabled={isDisabled || isDayOff} placeholder="Task description..." rows="1" className="w-full bg-transparent border-none text-sm py-1 resize-none dark:text-slate-200 outline-none" onChange={(e) => handleInputChange(day.dbDate, 'task_description', e.target.value)} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input type="text" value={logData[day.dbDate]?.hours_worked || ""} disabled={isDisabled || isDayOff} placeholder="HH:mm" className="w-16 bg-gray-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-center text-xs font-bold dark:text-white outline-none" onChange={(e) => handleInputChange(day.dbDate, 'hours_worked', e.target.value)} onBlur={(e) => formatTimeInput(day.dbDate, e.target.value)} />
                          </td>
                         <td className="px-6 py-4 text-center">
  <div className="flex justify-center">
    {/* We use a button (or div) to mimic the checkbox appearance. 
      This ensures the blue color stays vibrant even when the row is disabled.
    */}
    <button
      type="button"
      disabled={isDisabled || isDayOff}
      onClick={() => handleInputChange(day.dbDate, 'is_wfh', !logData[day.dbDate]?.is_wfh)}
      className={`
        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
        ${logData[day.dbDate]?.is_wfh 
          ? "bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
          : "bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-600"
        }
        ${(isDisabled || isDayOff) ? "cursor-default opacity-80" : "cursor-pointer hover:scale-110"}
      `}
    >
      {logData[day.dbDate]?.is_wfh && (
        <Check size={16} className="text-white stroke-[4]" /> 
      )}
    </button>
  </div>
</td>
                        </>
                      )}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isWeekEditable && !day.isWeekOff && ((!isSaved || isEditing) ? (
                            <button onClick={() => saveDay(day)} disabled={day.isFuture} className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-[10px] font-bold"><SaveIcon size={12}/> {isEditing ? "Update" : "Save"}</button>
                          ) : (
                            <button onClick={() => setEditingDate(day.dbDate)} disabled={day.isFuture} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"><Edit size={16}/></button>
                          ))}
                          {!day.isWeekOff && (<button onClick={() => setViewData(day)} className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"><Eye size={16}/></button>)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isWeekEditable && (
            <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button onClick={submitWeeklySheet} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center gap-2"><Send size={18} /> Save & Submit Weekly Timesheet</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserHome;