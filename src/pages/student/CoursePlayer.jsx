import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle, ChevronRight, ChevronLeft, Award,
  Layers, Video, Monitor, Loader2, AlertCircle, ArrowLeft,
  ChevronDown, BookOpen, ExternalLink, CheckCircle, Menu, Check, Star, X,
  FileText, CheckCircle2, ShieldAlert, Clock, RefreshCcw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEnrollment } from '../../shared/EnrollmentContext';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API, USER_API } from '../../config';
import { norm, buildLessons } from '../../components/course/CourseHelpers';
import { VideoPlayer, LivePanel, NotePanel } from '../../components/course/CoursePanels';
import { AssessmentPanel } from '../../components/course/AssessmentPanel';

/* ── helpers ─────────────────────────────────── */



/* ══════════ MARK COMPLETE BUTTON ══════════ */
function MarkCompleteButton({ isDone, isSynced, onMark }) {
  const [hovered, setHovered] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleClick = async () => {
    if (syncing) return;
    if (isDone && isSynced) return;
    setSyncing(true);
    try {
      await onMark();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleClick} 
      onMouseEnter={() => (!isDone || !isSynced) && setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
      style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1.6rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', 
        cursor: (isDone && isSynced) ? 'default' : 'pointer', transition: 'all 0.2s', 
        background: (isDone && isSynced) ? 'linear-gradient(135deg, #10b981, #059669)' : (isDone ? '#f0fdf4' : 'white'), 
        color: (isDone && isSynced) ? 'white' : '#10b981', 
        border: (isDone && isSynced) ? '2px solid transparent' : '2px solid #10b981', 
        transform: hovered && (!isDone || !isSynced) ? 'translateY(-1px)' : 'none', 
        opacity: (isDone && isSynced) ? 0.9 : 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {syncing ? (
        <><Loader2 size={18} className="animate-spin" /> Syncing...</>
      ) : isDone ? (
        isSynced ? (
          <><CheckCircle size={18} /> Completed</>
        ) : (
          <><AlertCircle size={18} /> Retry Sync</>
        )
      ) : (
        <><Check size={18} /> Mark as Complete</>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COURSE PLAYER
══════════════════════════════════════════════════ */
const CoursePlayer = ({ isTrainer = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const enrollment = useEnrollment();
  const { isEnrolled } = enrollment || {};
  const { user, authFetch } = useAuth(); // <-- Inject Secure Wrapper
  const [isExamInProgress, setIsExamInProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [justCompleted, setJustCompleted] = useState(false);
  const enrolled = isTrainer || (id && isEnrolled && isEnrolled(id));
  const [showReview, setShowReview] = useState(false);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Anti-Cheat: Prevent navigation while exam is in progress
  useEffect(() => {
    if (isExamInProgress) {
      const handlePopState = () => {
        // Force stay on page by pushing state back
        window.history.pushState(null, '', window.location.href);
      };

      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Exam in progress. Leaving will result in auto-submission.';
        return e.returnValue;
      };

      window.history.pushState(null, '', window.location.href);
      
      window.addEventListener('popstate', handlePopState);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isExamInProgress]);

  // Safe extraction of enrollment hooks/data
  const markLessonComplete = isTrainer ? () => { } : enrollment?.markLessonComplete;
  const isLessonComplete = isTrainer ? () => false : enrollment?.isLessonComplete;
  const isLessonSynced = isTrainer ? () => true : enrollment?.isLessonSynced;
  const getCompletedCount = isTrainer ? () => 0 : enrollment?.getCompletedCount;
  const enrolledCourses = isTrainer ? [] : enrollment?.enrolledCourses;
  const registerLessonCount = isTrainer ? () => { } : enrollment?.registerLessonCount;

  const markLiveAttendance = isTrainer ? async () => ({}) : enrollment?.markLiveAttendance;
  const markVideoProgress = isTrainer ? async () => ({}) : enrollment?.markVideoProgress;
  const markNoteProgress = isTrainer ? async () => ({}) : enrollment?.markNoteProgress;
  const submitAssessment = isTrainer ? async () => ({}) : enrollment?.submitAssessment;
  const assessmentStats = isTrainer ? {} : enrollment?.assessmentStats || {};
  const fetchCourseProgress = isTrainer ? async () => ({}) : enrollment?.fetchCourseProgress;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ Course_rating: '5', Instructor_rating: '5', Review: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    try {
      const res = await authFetch(`${USER_API}/courses/${id}/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      });
      if (!res.ok) throw new Error('Feedback submission failed');
      setReviewSuccess(true);
      setTimeout(() => setShowReview(false), 2500);
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // DEBUG LOG
  useEffect(() => {
    console.log('CoursePlayer: Active Course ID from URL:', id, 'TrainerMode:', isTrainer);
    if (!isTrainer) {
      const enrolledItem = enrolledCourses?.find(c => norm(c.id || c.course_id)?.toLowerCase() === norm(id)?.toLowerCase());
      console.log('CoursePlayer: Enrollment status:', enrolledItem ? 'ENROLLED' : 'NOT ENROLLED', enrolledItem);
    }
  }, [id, enrolledCourses, isTrainer]);

  const { data: queryData, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: ['course_details', id],
    queryFn: async () => {
      const res = await authFetch(`${ADMIN_API}/course/${id}/full-details`);
      if (!res.ok) throw new Error('Failed to fetch course');
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (queryData && queryData.course) {
      const c = queryData.course;
      setCourse(c);
      const built = buildLessons(c.modules, c.notes);
      setLessons(built);

      const typeLower = (c.type || c.course_type || c.course_Type || 'recorded').toLowerCase();
      const isLive = typeLower === 'live' || typeLower === 'live_course' || typeLower === 'live session';

      // Auto-select first ongoing or upcoming live session if live course
      if (isLive && built.length > 0) {
        const now = new Date();
        const liveIdx = built.findIndex(l => {
          if (l.type !== 'live') return false;
          const start = l.start_time ? new Date(l.start_time) : null;
          const end = l.end_time ? new Date(l.end_time) : null;
          // If live OR starting soon OR in future
          return (start && end && now >= start && now <= end) || (start && now < start);
        });
        if (liveIdx !== -1) setCurrentIdx(liveIdx);
      }

      // Register total so progress % computes correctly on My Learning page
      if (!isTrainer) {
        const activeBuilt = built.filter(l => l.type !== 'note' && l.type !== 'resource').length;
        if (registerLessonCount) registerLessonCount(id, activeBuilt);
      }
      
      const exp = {};
      (c.modules || []).forEach(m => { exp[m.module_id] = true; });
      setExpandedModules(exp);
      setLoading(false);
    } else if (queryError) {
      setError(queryError.message);
      setLoading(false);
    } else if (queryLoading && !course) {
      setLoading(true);
    }
  }, [queryData, queryError, queryLoading, id, isTrainer, registerLessonCount]);

  // Sync progress when course changes
  useEffect(() => {
    if (!isTrainer && id && fetchCourseProgress) {
      fetchCourseProgress(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isTrainer]);

  // Reset just-completed animation when lesson changes
  useEffect(() => { setJustCompleted(false); }, [currentIdx]);

  const currentLesson = lessons[currentIdx];
  const courseId = id;
  const totalLessons = lessons.length;

  /* Completed count + progress % */
  const completedCount = getCompletedCount(courseId);
  const activeTotal = lessons.filter(l => l.type !== 'note' && l.type !== 'resource').length;
  const progressPct = activeTotal > 0 ? Math.round((completedCount / activeTotal) * 100) : 0;

  /* Check if current lesson is done and synced with backend */
  const currentDone = currentLesson
    ? isLessonSynced(courseId, currentLesson.id)
    : false;

  /* Mark current lesson complete — only for video/live */
  const handleMarkComplete = useCallback(async () => {
    if (isTrainer || !currentLesson) return;
    // 🚫 Assessments are completed via submission flow, not manual marking
    if (currentLesson.type === 'assessment' || currentLesson.type === 'note') return;
    
    const sId = courseId;
    const lId = currentLesson.id;
    const mid = currentLesson.moduleId;

    if (isLessonSynced(sId, lId)) return;

    try {
      if (currentLesson.type === 'video') {
        await markVideoProgress(sId, mid, lId);
      } else if (currentLesson.type === 'live') {
        await markLiveAttendance(sId, lId, mid, true, true);
      }
      // Success animation
      setJustCompleted(true);
    } catch (err) {
      console.error("Failed to mark lesson as complete:", err);
      // Don't fake-complete on failure — keep button as "Mark as Complete"
    }
  }, [currentLesson, courseId, markVideoProgress, markLiveAttendance, isLessonSynced, isTrainer]);

  const go = idx => setCurrentIdx(Math.max(0, Math.min(lessons.length - 1, idx)));
  const toggleModule = mid => setExpandedModules(p => ({ ...p, [mid]: !p[mid] }));

  const lessonsByModule = {};
  lessons.forEach((l, idx) => {
    if (!lessonsByModule[l.moduleId]) lessonsByModule[l.moduleId] = [];
    lessonsByModule[l.moduleId].push({ ...l, globalIdx: idx });
  });

  const lessonTypeColor = (type) => {
    switch (type) {
      case 'video': return '#6366f1';
      case 'note': return '#f59e0b';
      case 'assessment': return '#8b5cf6';
      case 'live': return '#ec4899'; // Changed from red to pink to avoid 'recording' confusion
      default: return '#10b981';
    }
  };
  const lessonTypeIcon = t => {
    if (t === 'live') return <Monitor size={13} />;
    if (t === 'assessment') return <Award size={13} />;
    if (t === 'note') return <FileText size={13} />;
    return <Video size={13} />;
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--color-bg)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 1s linear infinite', boxShadow: '0 0 32px rgba(99,102,241,0.5)' }}>
        <Loader2 size={30} color="white" />
      </div>
      <p style={{ color: '#64748b', fontWeight: 600 }}>Loading course content...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Error ── */
  if (error || !course) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#0f172a', textAlign: 'center', padding: '2rem' }}>
      <AlertCircle size={52} color="#ef4444" />
      <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800 }}>Course Unavailable</h2>
      <p style={{ color: '#64748b' }}>This course could not be loaded.</p>
      <button onClick={() => navigate(isTrainer ? '/trainer/courses' : '/student/courses')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer' }}>
        ← {isTrainer ? 'Back to Courses' : 'My Learning'}
      </button>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden', color: 'var(--color-text)' }}>

      {/* ═══════════ TOP NAVIGATION ═══════════ */}
      {!isExamInProgress && (
        <header style={{ height: '60px', flexShrink: 0, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

          {/* Sidebar Toggle */}
          {!isExamInProgress && currentLesson?.type !== 'assessment' && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-full px-4 md:px-6 border-r border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
              style={{ color: sidebarOpen ? 'var(--color-primary)' : '#64748b' }}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Back */}
          <button
            onClick={() => navigate(isTrainer ? '/trainer/courses' : '/student/courses')}
            className="h-full px-4 md:px-6 border-r border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <ArrowLeft size={18} /> <span className="hidden sm:inline">{isTrainer ? 'Exit' : 'My Learning'}</span>
          </button>


          {/* Middle Title Section - Visible on Laptop+ */}
          <div className="hidden lg:flex flex-1 px-6 overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-slate-500 font-semibold text-[0.85rem] truncate max-w-[200px]">{course.title}</span>
              {currentLesson && (
                <>
                  <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                  <span className="text-slate-900 font-bold text-[0.85rem] truncate">{currentLesson.title}</span>
                </>
              )}
            </div>
          </div>

          {/* Progress Section */}
          {!isTrainer && (
            <div className="flex flex-1 lg:flex-none items-center justify-end gap-4 md:gap-8 px-4 md:px-10 h-full">
              {progressPct === 100 && (
                <button
                  onClick={() => { setReviewSuccess(false); setShowReview(true); }}
                  className="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[0.7rem] font-black transition-all shadow-sm active:scale-95"
                >
                  <Star size={14} /> RATE
                </button>
              )}
              <div className="text-right min-w-fit">
                <div className="hidden sm:block text-[0.6rem] text-slate-500 font-black uppercase tracking-wider mb-0.5">Progress</div>
                <div className={`text-[0.8rem] font-black ${progressPct === 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>
                  {completedCount}/{activeTotal} · {progressPct}%
                </div>
              </div>
              <div className="hidden sm:block w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${progressPct}%` }} 
                />
              </div>
            </div>
          )}

          {/* Prev / Next buttons */}
          <div className="flex items-center h-full border-l border-slate-200">
            <button 
              onClick={() => go(currentIdx - 1)} 
              disabled={currentIdx === 0} 
              className="h-full px-5 md:px-8 flex items-center gap-2 font-bold text-[0.85rem] border-r border-slate-200 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Prev</span>
            </button>
            <button 
              onClick={() => go(currentIdx + 1)} 
              disabled={currentIdx >= lessons.length - 1} 
              className="h-full px-5 md:px-8 flex items-center gap-2 font-black text-[0.85rem] transition-all bg-emerald-50/50 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-600"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
            </button>
          </div>
        </header>
      )}

      {/* ═══════════ BODY ═══════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>



        {/* ── Sidebar ── */}
        {!isExamInProgress && currentLesson?.type !== 'assessment' && (
          <aside 
            className="course-sidebar"
            style={{ 
              width: sidebarOpen ? '280px' : '0', 
              minWidth: sidebarOpen ? '280px' : '0', 
              background: 'var(--color-surface)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)', 
              borderRight: '1px solid var(--color-border)', 
              zIndex: 100,
              position: window.innerWidth <= 1024 && sidebarOpen ? 'fixed' : 'relative',
              height: window.innerWidth <= 1024 && sidebarOpen ? '100%' : 'auto',
              boxShadow: window.innerWidth <= 1024 && sidebarOpen ? '20px 0 50px rgba(0,0,0,0.1)' : 'none'
            }}
          >

            {/* Sidebar header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              <h3 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '0.875rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Menu size={16} color="var(--color-primary)" onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer' }} /> Course Content
              </h3>
              {/* Sidebar progress bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                <span>{completedCount} of {activeTotal} completed</span>
                <span style={{ color: progressPct === 100 ? '#10b981' : 'var(--color-primary)', fontWeight: 700 }}>{progressPct}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: progressPct === 100 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', width: `${progressPct}%`, borderRadius: '99px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Module list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.625rem' }}>
              {(() => {
                const displayModules = [...(course.modules || [])];
                if (lessonsByModule['global-resources']) {
                  displayModules.unshift({ module_id: 'global-resources', title: 'General Resources' });
                }
                return displayModules.map((mod, mi) => {
                  const modLessons = lessonsByModule[mod.module_id] || [];
                  const activeM = modLessons.filter(l => l.type !== 'note' && l.type !== 'resource');
                  const totalM = activeM.length;
                  const doneCount = activeM.filter(l => isLessonComplete(courseId, l.id)).length;
                  const isExp = expandedModules[mod.module_id];
                  return (
                    <div key={mod.module_id} style={{ marginBottom: '0.35rem' }}>
                      <button onClick={() => toggleModule(mod.module_id)} style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1rem', background: isExp ? 'var(--color-primary)08' : 'transparent', border: 'none', borderRadius: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', marginBottom: '0.4rem' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isExp ? 'var(--color-primary)' : 'var(--color-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExp ? 'white' : 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0, border: '1px solid var(--color-border)' }}>{mi + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isExp ? 'var(--color-text)' : 'var(--color-text-muted)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-light)' }}>
                            {totalM > 0 ? (
                              <>{doneCount}/{totalM} completed &bull; {Math.round((doneCount / totalM) * 100)}%</>
                            ) : (
                              <>{modLessons.length} {modLessons.length === 1 ? 'item' : 'items'}</>
                            )}
                          </div>
                        </div>
                        {/* Module completion ring */}
                        {totalM > 0 && doneCount === totalM && (
                          <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
                        )}
                        <ChevronDown size={14} color="var(--color-text-light)" style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0 }} />
                      </button>

                      {isExp && modLessons.map(lesson => {
                        const isActive = lesson.globalIdx === currentIdx;
                        const isDone = isLessonComplete(courseId, lesson.id);
                        const lStats = assessmentStats[norm(lesson.id)?.toLowerCase()] || { attempts_used: 0, passed: false };
                        const limit = (lesson.attemptLimit !== undefined && lesson.attemptLimit !== null) ? Number(lesson.attemptLimit) : 3;
                        const isFailed = lesson.type === 'assessment' && lStats.attempts_used >= limit && !lStats.passed;
                        const tc = lessonTypeColor(lesson.type);
                        return (
                          <button key={lesson.id} onClick={() => setCurrentIdx(lesson.globalIdx)}
                            style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem 0.6rem 2.5rem', background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem', borderLeft: isActive ? `3px solid ${tc}` : '3px solid transparent', transition: 'all 0.12s', paddingLeft: isActive ? 'calc(2.5rem - 3px)' : '2.5rem' }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                            {/* Done check or type icon */}
                            {isDone ? (
                              <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0 }} />
                            ) : isFailed ? (
                              <X size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                            ) : (
                              <span style={{ color: isActive ? tc : '#475569', flexShrink: 0 }}>{lessonTypeIcon(lesson.type)}</span>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: isActive ? 700 : 400, fontSize: '0.78rem', color: isDone ? '#10b981' : isActive ? '#e2e8f0' : '#64748b', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textDecoration: isDone && !isActive ? 'none' : 'none' }}>{lesson.title}</div>
                              <div style={{ fontSize: '0.67rem', color: isDone ? '#10b981' : '#334155', textTransform: 'capitalize', marginTop: '0.1rem' }}>
                                {isDone ? (lesson.type === 'assessment' ? '✓ Passed' : '✓ Done') : isFailed ? (
                                  <span style={{ color: '#ef4444' }}>✕ Failed</span>
                                ) : lesson.type === 'assessment' ? 'Assessment' : lesson.type === 'live' ? (lesson.end_time && new Date(lesson.end_time) < new Date() ? 'Past Session' : 'Live Session') : lesson.type === 'note' ? 'Resource' : 'Video'}
                              </div>
                            </div>
                            {isActive && !isDone && lesson.type !== 'live' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tc, flexShrink: 0, boxShadow: `0 0 6px ${tc}` }} />}
                          </button>
                        );
                      })}
                    </div>
                  );
                });
              })()}

              {lessons.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <BookOpen size={32} color="#334155" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: '#475569', fontSize: '0.82rem' }}>No lessons available yet.</p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ── Main Content ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg)' }}>
          <div className="p-4 md:p-8 lg:p-12" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ maxWidth: isExamInProgress ? '100%' : '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: isExamInProgress ? '100%' : 'auto' }}>

              {lessons.length === 0 && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <BookOpen size={52} color="#94a3b8" style={{ opacity: 0.4, marginBottom: '1rem' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No content available yet</h2>
                  <p style={{ color: '#94a3b8' }}>This course has no lessons. Check back soon!</p>
                </div>
              )}

              {currentLesson && (
                <>
                  {/* Lesson header row */}
                  {!isExamInProgress && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.22rem 0.75rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', background: currentLesson.type === 'video' ? 'rgba(99,102,241,0.1)' : currentLesson.type === 'live' ? 'rgba(239,68,68,0.1)' : currentLesson.type === 'note' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: lessonTypeColor(currentLesson.type) }}>
                            {lessonTypeIcon(currentLesson.type)}
                            {currentLesson.type === 'live' ? 'Live Session' : currentLesson.type === 'assessment' ? 'Assessment' : currentLesson.type === 'note' ? 'Resource' : 'Video Lesson'}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>· {currentLesson.moduleTitle}</span>
                          {currentDone && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                              <CheckCircle size={11} /> Completed
                            </span>
                          )}
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, margin: 0 }}>{currentLesson.title}</h1>
                      </div>

                      {/* Mark as complete button — FOR VIDEO/LIVE */}
                      {(currentLesson.type === 'video' || currentLesson.type === 'live') && !isTrainer && (
                        <MarkCompleteButton 
                          isDone={currentDone} 
                          isSynced={isLessonSynced(courseId, currentLesson.id)}
                          onMark={handleMarkComplete} 
                        />
                      )}
                    </div>
                  )}

                  {/* Lesson content */}
                  <div style={{ position: 'relative' }}>
                    {!enrolled && (
                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 100,
                        backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.4)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '24px', border: '2px dashed var(--color-primary)30',
                        padding: '2rem', textAlign: 'center'
                      }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid var(--color-primary)20' }}>
                          <ShieldAlert size={40} color="var(--color-primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Content Locked</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, maxWidth: '400px', marginBottom: '2rem' }}>
                          You are currently not enrolled in this course. Please enroll to access lectures, resources, and assessments.
                        </p>
                        <button
                          onClick={() => navigate('/student/browse')}
                          style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            color: 'white', padding: '1rem 2.5rem', borderRadius: '1rem', border: 'none',
                            fontWeight: 850, cursor: 'pointer', boxShadow: 'var(--shadow-lg)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                          }}
                        >
                          <BookOpen size={20} /> Browse Catalog
                        </button>
                      </div>
                    )}
                    <div style={{ opacity: enrolled ? 1 : 0.3, filter: enrolled ? 'none' : 'blur(4px)', pointerEvents: enrolled ? 'auto' : 'none' }}>
                      {currentLesson.type === 'video' && <VideoPlayer lesson={currentLesson} />}
                      {currentLesson.type === 'note' && <NotePanel lesson={currentLesson} />}
                      {currentLesson.type === 'live' && (
                        <LivePanel
                          lesson={currentLesson}
                          courseId={courseId}
                          onJoin={async (liveId, mid, isRecording = false) => {
                            await markLiveAttendance(courseId, liveId, mid, !isRecording, isRecording);
                            markLessonComplete(courseId, liveId, totalLessons);
                          }}
                        />
                      )}
                      {currentLesson.type === 'assessment' && (
                        <AssessmentPanel
                          lesson={currentLesson}
                          assessmentStats={assessmentStats}
                          onComplete={async (answers, timeTakenSeconds = 0) => {
                            const res = await submitAssessment(courseId, currentLesson.moduleId, currentLesson.id, answers, timeTakenSeconds);
                            if (res?.passed) markLessonComplete(courseId, currentLesson.id, totalLessons);
                            return res;
                          }}
                          onStateChange={setIsExamInProgress}
                        />
                      )}
                    </div>
                  </div>

                  {/* ── Bottom nav + advance ── */}
                  {!isExamInProgress && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '14px', padding: '1rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <button onClick={() => go(currentIdx - 1)} disabled={currentIdx === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '99px', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', color: currentIdx === 0 ? '#cbd5e1' : '#475569', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (currentIdx > 0) { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = currentIdx === 0 ? '#cbd5e1' : '#475569'; }}>
                        <ChevronLeft size={16} /> Previous
                      </button>

                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                        Lesson <strong style={{ color: '#6366f1' }}>{currentIdx + 1}</strong> / {lessons.length}
                      </span>

                      {currentIdx < lessons.length - 1 ? (
                        <button
                          onClick={() => go(currentIdx + 1)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', border: 'none', borderRadius: '10px',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                            boxShadow: '0 4px 12px rgba(99,102,241,0.25)', transition: 'all 0.2s'
                          }}>
                          Next Lesson <ChevronRight size={17} />
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '99px', fontWeight: 700, fontSize: '0.875rem', background: (!isTrainer && progressPct === 100) ? 'linear-gradient(135deg,#10b981,#059669)' : '#f1f5f9', color: (!isTrainer && progressPct === 100) ? 'white' : '#94a3b8' }}>
                          {(!isTrainer && progressPct === 100) ? <><CheckCircle size={16} /> Course Complete! 🎉</> : 'Last Lesson'}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Review Modal ────────────────────────────────────────────────── */}
      {/* ── Review Modal ────────────────────────────────────────────────── */}
      {showReview && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setShowReview(false)}
        >
          <div
            style={{ position: 'relative', width: 'min(95vw, 440px)', backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', border: '1px solid #f1f5f9' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Stepped Journey Background */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none', zIndex: 0, background: `linear-gradient(135deg, 
                rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.18) 15%,
                rgba(249,115,22,0.10) 15%, rgba(249,115,22,0.10) 30%,
                rgba(249,115,22,0.04) 30%, rgba(249,115,22,0.04) 45%,
                transparent 45%, transparent 55%,
                rgba(16,185,129,0.04) 55%, rgba(16,185,129,0.04) 70%,
                rgba(16,185,129,0.10) 70%, rgba(16,185,129,0.10) 85%,
                rgba(16,185,129,0.18) 85%, rgba(16,185,129,0.18) 100%)` }} />

            {/* Dashing Light Beam across the steps */}
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'linear-gradient(115deg, transparent 48.5%, rgba(255,255,255,0.7) 49.5%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 50.5%, transparent 51.5%)', pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {reviewSuccess ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #10b981' }}>
                    <CheckCircle size={40} color="#10b981" />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#064e3b' }}>Feedback Received!</h2>
                  <p style={{ color: '#047857', marginTop: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>Thank you for helping us evolve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Star size={20} color="#f97316" /> Course Evaluation
                      </h2>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem', marginLeft: '1.75rem' }}>Goal Achieved! You reached the top.</div>
                    </div>
                    <button type="button" onClick={() => setShowReview(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                      <X size={18} color="#64748b" />
                    </button>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Overall Rating</label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map(num => (
                        <button key={num} type="button" onClick={() => setFeedbackForm(prev => ({ ...prev, Course_rating: String(num) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.1s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                          <Star size={32} fill={num <= parseInt(feedbackForm.Course_rating) ? '#f97316' : '#f1f5f9'} color={num <= parseInt(feedbackForm.Course_rating) ? '#f97316' : '#cbd5e1'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Your Review</label>
                    <textarea
                      required rows="3"
                      placeholder="Tell us what you liked most..."
                      value={feedbackForm.Review}
                      onChange={e => setFeedbackForm(prev => ({ ...prev, Review: e.target.value }))}
                      style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', resize: 'none', outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#10b981'}
                      onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <button type="submit" disabled={submittingReview} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '1rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: submittingReview ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)', opacity: submittingReview ? 0.7 : 1, transition: 'transform 0.2s' }} onMouseEnter={e => !submittingReview && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => !submittingReview && (e.currentTarget.style.transform = 'none')}>
                    {submittingReview ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default CoursePlayer;
