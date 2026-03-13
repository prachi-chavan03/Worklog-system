import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Eye, X, User,Check } from 'lucide-react';

const ViewLogs = () => {
  const { id } = useParams(); 
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [logData, setLogData] = useState({});
  const [viewData, setViewData] = useState(null);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
  localStorage.getItem('theme') === 'dark' || 
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
);

  const todayStr = new Date().toLocaleDateString('en-CA');


  useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);
  useEffect(() => {
    const session = sessionStorage.getItem('user');
    if (!session) { navigate('/'); return; }

    const fetchData = async () => {
      try {
        const infoRes = await fetch(`${API_BASE_URL}/tasks/get-user-info/${id}`);
        const infoData = await infoRes.json();
        if (infoRes.ok) {
          setEmployeeName(infoData.full_name || infoData.name || infoData.userName || "Unknown User");
        }

        const logRes = await fetch(`${API_BASE_URL}/tasks/get-logs/${id}`);
        const logDataArray = await logRes.json();
        if (logRes.ok && Array.isArray(logDataArray)) {
          const formattedData = {};
          logDataArray.forEach(log => {
            const dateKey = new Date(log.work_date).toLocaleDateString('en-CA');
            formattedData[dateKey] = {
              day_type: log.day_type || "Working",
              project_name: log.project_name,
              module_name: log.module_name || "",
              task_description: log.task_description,
              hours_worked: log.hours_worked, 
              is_wfh: log.is_wfh === 1
            };
          });
          setLogData(formattedData);
        }
      } catch (error) { console.error("Fetch error:", error); }
    };
    fetchData();
  }, [id, navigate, API_BASE_URL]);

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
          return { 
            name: d.toLocaleDateString('en-US', { weekday: 'long' }), 
            date: d.toLocaleDateString('en-GB'), 
            dbDate, 
            isWeekOff: d.getDay() === 0 || d.getDay() === 6
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
          name: dayName, date: current.toLocaleDateString('en-GB'), dbDate,
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* VIEW MODAL */}
      {viewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewData.name}</h3>
                <p className="text-xs font-bold text-blue-600">{viewData.date}</p>
              </div>
              <button onClick={() => setViewData(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.project_name || "N/A"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.module_name || "N/A"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours Worked</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.hours_worked || "00:00"}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</p><p className="text-sm font-bold text-gray-800 dark:text-slate-200">{logData[viewData.dbDate]?.is_wfh ? "Work From Home" : "Office"}</p></div>
               </div>
               <div className="space-y-1 pt-2">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Description</p>
                 <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 min-h-[100px]">
                   <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{logData[viewData.dbDate]?.task_description || "No description provided."}</p>
                 </div>
               </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setViewData(null)} className="px-6 py-2 bg-gray-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 transition-colors"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                <User size={20}/> Reviewing Logs: <span className="text-gray-900 dark:text-white">{employeeName || "User"}</span>
            </h1>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
            View Only Mode
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-4 bg-gray-900 dark:bg-blue-600 text-white p-4 rounded-2xl shadow-sm transition-colors">
          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Weekly Timesheet Review</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
          
          {/* FILTER BAR */}
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Calendar className="text-blue-600" size={20} />
              {!isCustomRange ? (
                <select 
                  className="w-full md:w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none shadow-sm dark:text-white" 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                >
                  {weekData.map((range, idx) => (<option key={idx} value={idx}>{range.label}</option>))}
                </select>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <input type="date" className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none dark:text-white" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                  <span className="text-[10px] font-black text-gray-400">TO</span>
                  <input type="date" className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none dark:text-white" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                </div>
              )}
            </div>
            <button 
              onClick={() => { setIsCustomRange(!isCustomRange); if(isCustomRange) { setCustomStartDate(""); setCustomEndDate(""); } }}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${
                isCustomRange 
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/50" 
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/50"
              }`}
            >
              {isCustomRange ? "Close Custom Range" : "Set Custom Range"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 uppercase text-[11px] font-black text-gray-400 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Day / Date</th>
                  <th className="px-6 py-4">Day Type</th>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Module Name</th>
                  <th className="px-6 py-4">Your Task</th>
                  <th className="px-6 py-4 text-center">Hours</th>
                  <th className="px-6 py-4 text-center">WFH</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {currentDays.map((day, idx) => {
                  const data = logData[day.dbDate];
                  return (
                    <tr key={idx} className={`transition-colors ${day.isWeekOff ? 'bg-red-50/50 dark:bg-red-950/20' : 'hover:bg-blue-50/20 dark:hover:bg-blue-900/10'}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-slate-100">{day.name}</div>
                        <div className="text-[10px] font-bold text-gray-400">{day.date}</div>
                      </td>
                      {day.isWeekOff ? (
                        <td colSpan="6" className="px-6 py-4 text-center"><span className="text-red-500 font-black uppercase tracking-widest text-xs">Week Off</span></td>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">{data?.day_type || "—"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-slate-300">{data?.project_name || "—"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400">{data?.module_name || "—"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">{data?.task_description || "—"}</td>
                          <td className="px-6 py-4 text-center">
  <div className="flex justify-center">
    {/* This div acts as the checkbox frame */}
    <div className={`
      w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
      ${data?.is_wfh 
        ? "bg-blue-600 border-blue-600" // Filled blue when checked
        : "bg-transparent border-slate-400 dark:border-slate-500" // Blank with visible border when unchecked
      }
    `}>
      {data?.is_wfh && (
        <Check size={14} className="text-white stroke-[4]" /> 
      )}
    </div>
  </div>
</td>
                        </>
                      )}
                      <td className="px-6 py-4 text-center">
                        {!day.isWeekOff && (
                          <button onClick={() => setViewData(day)} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <Eye size={18}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewLogs;