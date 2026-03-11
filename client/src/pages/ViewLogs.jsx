import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Eye, X, User } from 'lucide-react';

const ViewLogs = () => {
  const { id } = useParams(); 
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [logData, setLogData] = useState({});
  const [dbProjects, setDbProjects] = useState([]); 
  const [viewData, setViewData] = useState(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  

  useEffect(() => {
    // 1. SECURITY CHECK: Run this before anything else
    const session = sessionStorage.getItem('user');
    if (!session) {
      navigate('/');
      return;
    }

    // 2. DEFINE FETCH LOGIC
    const fetchData = async () => {
      try {
        // Fetch projects
        const projRes = await fetch(`${API_BASE_URL}/tasks/projects`);
        const projData = await projRes.json();
        if (projRes.ok) setDbProjects(projData);

        // Fetch User Info
        const infoRes = await fetch(`${API_BASE_URL}/tasks/get-user-info/${id}`);
        const infoData = await infoRes.json();
        if (infoRes.ok) setEmployeeName(infoData.full_name);

        // Fetch User Logs
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
      } catch (error) { 
        console.error("Fetch error:", error); 
      }
    };

    // 3. EXECUTE FETCH
    fetchData();

  }, [id, navigate, API_BASE_URL]); // Dependencies ensure it re-runs if ID changes

  // ... (rest of your component: getWeekRanges, return statement, etc.)
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
  const currentDays = weekData[selectedWeek].days;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* VIEW MODAL (Same as UserHome) */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div><h3 className="text-lg font-bold text-gray-900">{viewData.name}</h3><p className="text-xs font-bold text-blue-600">{viewData.date}</p></div>
              <button onClick={() => setViewData(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} className="text-gray-500" /></button>
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

      {/* HEADER */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                <User size={20}/> Reviewing Logs: {employeeName || "User"}
            </h1>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
            View Only Mode
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-4 bg-gray-900 text-white p-4 rounded-2xl shadow-sm"><h2 className="text-sm font-black uppercase tracking-[0.2em]">Weekly Timesheet Review</h2></div>
        
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
                  <th className="px-6 py-4">Day / Date</th>
                  <th className="px-6 py-4">Day Type</th>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Module Name</th>
                  <th className="px-6 py-4">Your Task</th>
                  <th className="px-6 py-4 text-center">Hours</th>
                  <th className="px-6 py-4 text-center">WFH</th>
                  <th className="px-6 py-4 text-center w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentDays.map((day, idx) => {
                  const data = logData[day.dbDate];
                  return (
                    <tr key={idx} className={`transition-colors ${day.isWeekOff ? 'bg-red-50/50' : 'hover:bg-blue-50/20'}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{day.name}</div>
                        <div className="text-[10px] font-bold text-gray-400">{day.date}</div>
                      </td>
                      
                      {day.isWeekOff ? (
                        <td colSpan="6" className="px-6 py-4 text-center"><span className="text-red-500 font-black uppercase tracking-widest text-xs">Week Off</span></td>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">
                            {data?.day_type || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            {data?.project_name || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500">
                            {data?.module_name || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                            {data?.task_description || "—"}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-sm">
                            {data?.hours_worked || "00:00"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={!!data?.is_wfh} disabled className="w-4 h-4 text-blue-600 rounded" />
                          </td>
                        </>
                      )}
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          {!day.isWeekOff && (
                            <button onClick={() => setViewData(day)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                              <Eye size={18}/>
                            </button>
                          )}
                        </div>
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