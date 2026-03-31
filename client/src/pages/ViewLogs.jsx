import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Eye, X, User, AlertCircle } from 'lucide-react';

const ViewLogs = () => {
  const { id } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  
  // States
  const [employeeName, setEmployeeName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [logData, setLogData] = useState({});
  const [dbProjects, setDbProjects] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Assuming theme is managed via a class on body or local state
  // For this sync, we'll check if the 'dark' class exists on document
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const session = sessionStorage.getItem('user');
    if (!session) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const infoRes = await fetch(`${API_BASE_URL}/tasks/get-user-info/${id}`);
        const infoData = await infoRes.json();
        if (infoRes.ok) {
          setEmployeeName(infoData.full_name || infoData.name || infoData.userName || "Unknown User");
        }

        const [projRes, logRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tasks/projects`),
          fetch(`${API_BASE_URL}/tasks/get-logs/${id}`)
        ]);

        const projData = await projRes.json();
        if (projRes.ok) setDbProjects(projData);

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
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
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
        days: Array.from({ length: 7 }, (_, idx) => {
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
  const currentDays = weekData[selectedWeek].days;

  return (
    <>
      {/* 1. THE LOADER OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white/80 dark:bg-slate-950/85 backdrop-blur-md z-[9999]">
          <div className="relative mb-12">
            <style>{`
              .orbital {
                --d: 24.5px; width: 4px; height: 4px; border-radius: 50%; color: #3b82f6;
                box-shadow: calc(1*var(--d)) 0 0, calc(0.707*var(--d)) calc(0.707*var(--d)) 0 1px, 0 calc(1*var(--d)) 0 2px, calc(-0.707*var(--d)) calc(0.707*var(--d)) 0 3px, calc(-1*var(--d)) 0 0 4px, calc(-0.707*var(--d)) calc(-0.707*var(--d)) 0 5px, 0 calc(-1*var(--d)) 0 6px;
                animation: orbitalDots 1s infinite steps(8);
              }
              @keyframes orbitalDots { 100% { transform: rotate(1turn) } }
            `}</style>
            <div className="orbital"></div>
          </div>
          <div className="text-center animate-pulse">
            <p className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Loading Logs...</p>
            <p className="text-[10px] font-medium mt-1 text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Preparing {employeeName}'s timesheet</p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 ${isLoading ? 'blur-sm' : ''}`}>
        
        {/* VIEW MODAL (Enhanced with Dark Mode matching your Manager Dashboard) */}
        {viewData && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-transparent dark:border-slate-800">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{viewData.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{viewData.date}</p>
                </div>
                <button onClick={() => setViewData(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{logData[viewData.dbDate]?.project_name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{logData[viewData.dbDate]?.module_name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours Worked</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{logData[viewData.dbDate]?.hours_worked || "00:00"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{logData[viewData.dbDate]?.is_wfh ? "Work From Home" : "Office"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Description</p>
                  <div className="bg-slate-50 dark:bg-[#0f172a]/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[120px]">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {logData[viewData.dbDate]?.task_description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#0f172a]/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button onClick={() => setViewData(null)} className="px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
              <User size={20} /> Reviewing Logs: <span className="text-slate-900 dark:text-white">{employeeName || "User"}</span>
            </h1>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
            View Only Mode
          </div>
        </nav>

        <main className="p-8 max-w-7xl mx-auto">
          <div className="mb-8 bg-slate-900 dark:bg-blue-600 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Weekly Timesheet Review</h2>
            <Calendar size={20} className="opacity-50" />
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
              <select 
                className="w-full md:w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500/20 transition-all dark:text-white" 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              >
                {weekData.map((range, idx) => (<option key={idx} value={idx}>{range.label}</option>))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 uppercase text-[11px] font-black text-slate-400 dark:text-slate-500">
                  <tr>
                    <th className="px-6 py-5">Day / Date</th>
                    <th className="px-6 py-5">Day Type</th>
                    <th className="px-6 py-5">Project</th>
                    <th className="px-6 py-5">Module</th>
                    <th className="px-6 py-5">Task Summary</th>
                    <th className="px-6 py-5 text-center">Hours</th>
                    <th className="px-6 py-5 text-center">WFH</th>
                    <th className="px-6 py-5 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {currentDays.map((day, idx) => {
                    const data = logData[day.dbDate];
                    return (
                      <tr key={idx} className={`transition-colors group ${day.isWeekOff ? 'bg-red-50/30 dark:bg-red-900/10' : 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10'}`}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{day.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">{day.date}</div>
                        </td>
                        
                        {day.isWeekOff ? (
                          <td colSpan="6" className="px-6 py-4 text-center">
                            <span className="text-red-500 dark:text-red-400 font-black uppercase tracking-widest text-[10px] bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">Week Off</span>
                          </td>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {data?.day_type || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                              {data?.project_name || "—"}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-400 dark:text-slate-500">
                              {data?.module_name || "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                              {data?.task_description || "—"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-black text-sm text-slate-700 dark:text-slate-200">{data?.hours_worked || "0:00"}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={!!data?.is_wfh} disabled className="w-4 h-4 text-blue-600 rounded" />
                          </td>
                          </>
                        )}
                        
                        <td className="px-6 py-4 text-center">
                          {!day.isWeekOff && (
                            <button 
                              onClick={() => setViewData(day)} 
                              className="p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all"
                            >
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
    </>
  );
};

export default ViewLogs;