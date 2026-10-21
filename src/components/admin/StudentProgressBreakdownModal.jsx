import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Video, 
  Award, ChevronDown, ChevronUp, Clock, Check, ShieldAlert,
  Loader2, Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API } from '../../config';

const StudentProgressBreakdownModal = ({
  isOpen,
  onClose,
  userId,
  studentName,
  studentEmail,
  courseId,
  courseTitle,
  onProgressUpdated
}) => {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const fetchBreakdown = async () => {
    if (!userId || !courseId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(`${ADMIN_API}/student/${userId}/course/${courseId}/breakdown`);
      if (!res.ok) {
        throw new Error(`Failed to load breakdown (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json && json.status && json.data) {
        setBreakdownData(json.data);
        // Expand modules with missing items or expand the first 2 modules by default
        const initExpanded = {};
        json.data.modules?.forEach((m, idx) => {
          if (!m.is_completed || idx < 2) {
            initExpanded[m.module_id] = true;
          }
        });
        setExpandedModules(initExpanded);
      } else {
        throw new Error(json.message || "Invalid breakdown data returned");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBreakdown();
    } else {
      setBreakdownData(null);
      setError(null);
    }
  }, [isOpen, userId, courseId]);

  const handleRecalculate = async () => {
    if (recalculating || !userId || !courseId) return;
    try {
      setRecalculating(true);
      const res = await authFetch(`${ADMIN_API}/student/${userId}/course/${courseId}/recalculate`, {
        method: 'POST'
      });
      const json = await res.json();
      if (res.ok && json.status) {
        setToastMessage(`Updated to ${json.progress_percentage}%!`);
        setTimeout(() => setToastMessage(null), 3500);
        await fetchBreakdown();
        if (onProgressUpdated) {
          onProgressUpdated(json.progress_percentage);
        }
      } else {
        alert(json.detail || "Failed to recalculate progress");
      }
    } catch (err) {
      alert(`Error recalculating: ${err.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  if (!isOpen) return null;

  const data = breakdownData;
  const summary = data?.summary || {};
  const is100 = data?.progress_percentage === 100;
  const missing = data?.missing_requirements || [];

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="p-5 md:p-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[0.7rem] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Course Inspection
              </span>
              <span className="text-xs font-bold text-slate-500 truncate">
                {studentName || 'Student'} ({studentEmail})
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">
              {courseTitle || data?.course_title || 'Course Breakdown'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Recalculate Button */}
            <button
              onClick={handleRecalculate}
              disabled={recalculating || loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              title="Force recalculate course progress directly against database"
            >
              <RefreshCw size={14} className={recalculating ? "animate-spin" : ""} />
              <span>{recalculating ? "Recalculating..." : "Recalculate"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Toast notification if any ── */}
        {toastMessage && (
          <div className="bg-emerald-500 text-white text-xs font-black py-2 px-6 text-center animate-fade-in flex items-center justify-center gap-2">
            <Check size={14} /> {toastMessage}
          </div>
        )}

        {/* ── Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6 no-scrollbar">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-emerald-500" />
              <p className="text-sm font-bold text-slate-500">Loading granular completion records...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <AlertCircle size={22} className="shrink-0" />
              <div>
                <div className="font-black text-sm">Failed to inspect course</div>
                <div className="text-xs font-semibold mt-0.5">{error}</div>
              </div>
            </div>
          ) : data ? (
            <>
              {/* ── Status Banner & Progress Meter ── */}
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                is100 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    is100 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {is100 ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {is100 ? "Course Complete! 100% Verified" : `Course In Progress (${data.progress_percentage}%)`}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {is100 
                        ? "All videos watched and all assessments passed. Student is eligible for Certificate."
                        : `Student still has ${missing.length} item(s) pending before completion.`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  <div className="text-right">
                    <div className="text-[0.65rem] font-black uppercase tracking-wider text-slate-500">Overall Progress</div>
                    <div className={`text-2xl font-black ${is100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {data.progress_percentage}%
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Metric Summary Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Videos */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Video size={14} /> Video Lessons
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-black ${
                      summary.watched_videos >= summary.total_videos ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {summary.watched_videos >= summary.total_videos ? "100% Done" : `${Math.round((summary.watched_videos/summary.total_videos)*100 || 0)}%`}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {summary.watched_videos} <span className="text-xs font-semibold text-slate-400">/ {summary.total_videos} Watched</span>
                  </div>
                </div>

                {/* Assessments */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Award size={14} /> Quizzes & Tests
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-black ${
                      summary.passed_assessments >= summary.total_assessments ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {summary.passed_assessments >= summary.total_assessments ? "All Passed" : `${summary.total_assessments - summary.passed_assessments} Pending`}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {summary.passed_assessments} <span className="text-xs font-semibold text-slate-400">/ {summary.total_assessments} Passed</span>
                  </div>
                </div>

                {/* Modules */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <BookOpen size={14} /> Modules Finished
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-black ${
                      summary.completed_modules >= summary.total_modules ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {summary.completed_modules} / {summary.total_modules}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {summary.completed_modules} <span className="text-xs font-semibold text-slate-400">/ {summary.total_modules} Modules</span>
                  </div>
                </div>
              </div>

              {/* ── Missing Items Alert Box ── */}
              {missing.length > 0 && (
                <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm mb-3">
                    <ShieldAlert size={18} />
                    <span>Exact Requirements Missing for 100% Completion ({missing.length}):</span>
                  </div>
                  <div className="space-y-2">
                    {missing.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-black text-[0.65rem] uppercase ${
                            item.type === 'assessment' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {item.type}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                          <span className="text-slate-400 text-[0.7rem]">({item.module_title})</span>
                        </div>
                        <div className="font-black text-rose-600 dark:text-rose-400 shrink-0">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Granular Module Accordion ── */}
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Detailed Curriculum Breakdown ({data.modules?.length || 0} Modules)</span>
                  <span className="text-xs font-semibold text-slate-400">Click to expand/collapse</span>
                </h4>

                <div className="space-y-2.5">
                  {data.modules?.map((mod, idx) => {
                    const isExpanded = !!expandedModules[mod.module_id];
                    return (
                      <div 
                        key={mod.module_id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
                      >
                        {/* Module Row Header */}
                        <div 
                          onClick={() => toggleModule(mod.module_id)}
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {mod.title}
                              </h5>
                              <div className="text-[0.7rem] text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                                <span>{mod.videos_count} Videos</span>
                                <span>•</span>
                                <span>{mod.assessments_count} Quizzes</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-black ${
                              mod.is_completed 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {mod.is_completed ? "Completed ✓" : "In Progress"}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 space-y-2 text-xs"
                            >
                              {/* Videos in Module */}
                              {mod.videos?.map(v => (
                                <div 
                                  key={v.video_id}
                                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Video size={14} className={v.completed ? "text-emerald-500" : "text-slate-400"} />
                                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{v.title}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black shrink-0 ${
                                    v.completed 
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {v.completed ? "Watched ✓" : "Pending"}
                                  </span>
                                </div>
                              ))}

                              {/* Assessments in Module */}
                              {mod.assessments?.map(a => (
                                <div 
                                  key={a.assessment_id}
                                  className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between gap-3 ${
                                    a.passed ? 'border-slate-200/70 dark:border-slate-800' : 'border-rose-200 dark:border-rose-900/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Award size={14} className={a.passed ? "text-emerald-500" : "text-rose-500"} />
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{a.title}</span>
                                      <span className="text-[0.65rem] text-slate-400 font-semibold">
                                        Pass Mark: {a.passing_mark}/{a.total_mark} | Attempts: {a.attempts_used}/{a.attempt_limit}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black ${
                                      a.passed 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    }`}>
                                      {a.passed ? `Passed (${a.score}/${a.total_mark}) ✓` : (a.attempts_used > 0 ? `Failed (${a.score}/${a.total_mark})` : 'Not Attempted')}
                                    </span>
                                  </div>
                                </div>
                              ))}

                              {(!mod.videos?.length && !mod.assessments?.length) && (
                                <div className="text-slate-400 text-xs italic py-2 text-center">No lessons or quizzes in this module</div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default StudentProgressBreakdownModal;
