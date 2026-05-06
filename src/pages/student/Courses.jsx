import {
  BookOpen, PlayCircle, Clock, Award, Compass,
  CheckCircle, Layers, Video, Monitor, BarChart2,
  Zap, Star, X, Loader2, MessageSquare, ArrowRight
} from 'lucide-react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '../../shared/EnrollmentContext';
import { useAuth } from '../../shared/AuthContext';
import { useTheme } from '../../shared/ThemeContext';
import { USER_API } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';



const StudentCourses = () => {
  const [activeTab, setActiveTab]       = useState('ongoing');
  const navigate                        = useNavigate();
  const { enrolledCourses, getCourseProgress } = useEnrollment();
  const { authFetch }                   = useAuth();
  const { isDark }                      = useTheme();


  // ── Feedback state ────────────────────────────────────────────────────────
  const [feedbackCourse,    setFeedbackCourse]    = useState(null);
  const [feedbackForm,      setFeedbackForm]      = useState({ Course_rating: '5', Instructor_rating: '5', Review: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess,   setFeedbackSuccess]   = useState(false);

  // ── Certificate state ──────────────────────────────────────────────────
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Reset form whenever a new course is selected for feedback
  useEffect(() => {
    if (feedbackCourse) {
      setFeedbackForm({ Course_rating: '5', Instructor_rating: '5', Review: '' });
      setFeedbackSuccess(false);
    }
  }, [feedbackCourse]);

  // ── Missing handler (was referenced but never defined) ────────────────────
  const handleSubmitFeedback = useCallback(async (e) => {
    e.preventDefault();
    if (!feedbackCourse) return;

    const courseId = feedbackCourse.id || feedbackCourse.course_id;

    setSubmittingFeedback(true);
    try {
      // Securely fetch without exposing the token
      const res = await authFetch(`${USER_API}/courses/${courseId}/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      });

      if (!res.ok) throw new Error('Feedback submission failed');

      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackCourse(null), 2500);
    } catch (err) {
      console.error('Feedback error:', err);
      // TODO: surface a toast/error UI here
    } finally {
      setSubmittingFeedback(false);
    }
  }, [feedbackCourse, feedbackForm, authFetch]);

  // ── Derived course lists (Strictly Backend-Driven) ───────────────────────
  const { ongoingCourses, completedCourses, inProgressCount, completedCount } = useMemo(() => {
    const ongoing   = [];
    const completed = [];
    let inProgress  = 0;
    let done        = 0;

    enrolledCourses.forEach(course => {
      // Strictly trust the progress reported by the backend API
      const prog = course.progress || 0;
      
      if (prog === 100) {
        completed.push({ ...course, progress: prog });
        done++;
      } else {
        ongoing.push({ ...course, progress: prog });
        if (prog > 0) inProgress++;
      }
    });

    return { ongoingCourses: ongoing, completedCourses: completed, inProgressCount: inProgress, completedCount: done };
  }, [enrolledCourses]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'ongoing',   label: 'In Progress', count: ongoingCourses.length },
    { id: 'completed', label: 'Completed',   count: completedCourses.length },
  ];

  const getTypeStyle = useCallback((type) => {
    const t      = (type || '').toLowerCase();
    const isLive = t === 'live' || t === 'live_course' || t === 'live session';
    return {
      bg:    isLive ? 'rgba(239, 68, 68, 0.1)'  : 'rgba(16, 185, 129, 0.1)',
      color: isLive ? '#ef4444'                  : '#10b981',
      label: isLive ? 'Live Session'             : 'Recorded',
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="p-6 md:p-14 mb-8 md:mb-10" style={{
        background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        borderRadius: '2.5rem',
        position: 'relative', overflow: 'hidden',
        boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 20px 50px rgba(16, 185, 129, 0.15)',
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: isDark ? 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-2xl md:text-5xl" style={{ fontWeight: 950, color: 'white', letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
            My Learning <span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>Journey</span>
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', fontWeight: 600, maxWidth: '600px', lineHeight: 1.5 }}>
            {enrolledCourses.length > 0
              ? `You have ${enrolledCourses.length} active programs in your expertise portfolio.`
              : 'Start your professional transformation by exploring our catalog.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button
              onClick={() => navigate('/student/browse')}
              style={{
                background: '#f97316', color: 'white', border: 'none',
                padding: '1rem 2.5rem', borderRadius: '1.25rem', fontWeight: 900, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                boxShadow: '0 12px 30px rgba(249, 115, 22, 0.3)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(249, 115, 22, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(249, 115, 22, 0.3)'; }}
            >
              <Compass size={22} /> Discover New Courses
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs + summary ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:gap-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

          <div style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }} className="flex p-1.5 rounded-2xl w-full sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-4 md:px-7 py-2.5 rounded-xl border-none transition-all flex items-center justify-center gap-2 text-sm font-black ${
                  activeTab === tab.id 
                  ? (isDark ? 'bg-white text-slate-900 shadow-xl' : 'bg-white text-slate-900 shadow-sm') 
                  : 'bg-transparent text-slate-500'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === tab.id ? 'bg-emerald-500 text-white' : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-300 text-white')
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '4px' }} />
              <span>{completedCount} Completed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#6366f1', borderRadius: '4px' }} />
              <span>{inProgressCount} Ongoing</span>
            </div>
          </div>
        </div>

        {/* ── Courses Grid ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'ongoing' ? (
            <motion.div
              key="ongoing"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6"
            >
              {ongoingCourses.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 2rem', background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '2.5rem', border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <Zap size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: isDark ? 'white' : '#1e293b' }}>Ignite Your Curiosity</h3>
                  <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontWeight: 600 }}>Your learning list is empty. Ready to start something new?</p>
                </div>
              ) : (
                ongoingCourses.map(course => {
                  const cid      = course.id || course.course_id;
                  const progress = course.progress || 0;
                  const status   = getTypeStyle(course.type);

                  return (
                    <motion.div
                      key={cid} layout
                      style={{
                        background: isDark ? '#1e293b' : 'white', 
                        borderRadius: '2rem', 
                        overflow: 'hidden',
                        border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                        boxShadow: isDark ? 'none' : '0 10px 30px -5px rgba(0,0,0,0.05)',
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      className="group p-2 md:p-4 gap-3 md:gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      onClick={() => navigate(`/student/course/${cid}`)}
                    >
                      {/* Compact Thumbnail - Optimized for 320px */}
                      <div className="w-16 h-16 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900 shadow-sm">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0 pr-2 md:pr-4">
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ fontSize: '0.65rem', fontWeight: 950, color: status.color, background: `${status.color}15`, padding: '0.2rem 0.6rem', borderRadius: '0.6rem', textTransform: 'uppercase' }}>
                            {status.label}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFeedbackCourse(course); }}
                            className="text-slate-400 hover:text-orange-500 transition-colors p-1"
                          >
                            <Star size={16} />
                          </button>
                        </div>

                        <h3 className="text-sm md:text-lg font-black leading-tight mb-3 line-clamp-2" style={{ color: isDark ? 'white' : '#1e293b' }}>
                          {course.title || course.course_title}
                        </h3>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span style={{ color: '#94a3b8' }}>Progress</span>
                            <span style={{ color: '#10b981' }}>{progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-white dark:bg-white/10 rounded-full overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }}
                              className="rounded-full shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Compact Action Icon */}
                      <div className="hidden sm:flex w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6"
            >
              {completedCourses.map(course => (
                <div 
                  key={course.id || course.course_id} 
                  style={{ 
                    background: isDark ? '#1e293b' : 'white', 
                    borderRadius: '2rem', 
                    border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`, 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                  className="p-3 md:p-5 gap-3 md:gap-5"
                >
                  <div 
                    className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' }}
                  >
                    <Award className="w-6 h-6 md:w-8 md:h-8" color="#10b981" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-lg font-black truncate" style={{ color: isDark ? 'white' : '#1e293b' }}>
                      {course.title}
                    </h4>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 font-bold">
                      Program Graduate · {course.level || 'Expert'}
                    </p>
                    <div className="flex flex-wrap gap-3 md:gap-4 mt-3">
                      <button 
                        onClick={() => navigate(`/student/course/${course.id || course.course_id}`)} 
                        className="bg-transparent border-none text-emerald-500 font-black text-[10px] md:text-xs cursor-pointer p-0"
                      >
                        Review Module
                      </button>
                      <button 
                        onClick={() => setViewingCertificate(course)}
                        className="bg-transparent border-none text-orange-500 font-black text-[10px] md:text-xs cursor-pointer p-0"
                      >
                        Download Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Feedback Modal ────────────────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {feedbackCourse && (
            <div
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
              onClick={() => setFeedbackCourse(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                style={{ position: 'relative', width: 'min(95vw, 440px)', backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', border: '1px solid #f1f5f9' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Stepped Journey Background */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none', zIndex: 0, background: `linear-gradient(135deg, 
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
                  {feedbackSuccess ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                      <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #10b981' }}>
                        <CheckCircle size={40} color="#10b981" />
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#064e3b' }}>Feedback Received!</h2>
                      <p style={{ color: '#047857', marginTop: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>Thank you for helping us evolve.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitFeedback} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Star size={20} color="#f97316" /> Course Evaluation
                          </h2>
                          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem', marginLeft: '1.75rem' }}>Goal Achieved! You reached the top.</div>
                        </div>
                        <button type="button" onClick={() => setFeedbackCourse(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }} onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.background='#f8fafc'}>
                          <X size={18} color="#64748b" />
                        </button>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Overall Rating</label>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {[1, 2, 3, 4, 5].map(num => (
                            <button key={num} type="button" onClick={() => setFeedbackForm(prev => ({ ...prev, Course_rating: String(num) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.1s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
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
                          onFocus={e=>e.currentTarget.style.borderColor='#10b981'}
                          onBlur={e=>e.currentTarget.style.borderColor='#e2e8f0'}
                        />
                      </div>

                      <button type="submit" disabled={submittingFeedback} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '1rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: submittingFeedback ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)', opacity: submittingFeedback ? 0.7 : 1, transition: 'transform 0.2s' }} onMouseEnter={e=>!submittingFeedback&&(e.currentTarget.style.transform='translateY(-2px)')} onMouseLeave={e=>!submittingFeedback&&(e.currentTarget.style.transform='none')}>
                        {submittingFeedback ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
                        {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Certificate Preview Modal ────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {viewingCertificate && (
            <div
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem md:padding-2rem' }}
              onClick={() => setViewingCertificate(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                style={{ 
                  position: 'relative', 
                  width: 'min(92vw, 420px)', 
                  backgroundColor: isDark ? '#1e293b' : 'white', 
                  borderRadius: '2.5rem', 
                  overflow: 'hidden', 
                  boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6)', 
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` 
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <img 
                    src={viewingCertificate.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                    alt="Certificate Banner" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="text-[9px] font-black tracking-[0.25em] text-white/60 uppercase mb-2 block">
                      Technical Certification
                    </span>
                    <h2 className="text-lg md:text-2xl font-black text-white leading-tight">
                      {viewingCertificate.title}
                    </h2>
                  </div>

                  <div className="absolute top-5 right-5 w-11 h-11 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center">
                    <CheckCircle size={22} className="text-emerald-500" />
                  </div>
                </div>

                <div className="p-6 md:p-10">
                  <div className="mb-8">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block mb-2">
                      Issued Date
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-lg md:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        May 2026
                      </span>
                      <span className="text-slate-400 font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">5628-GT</span>
                    </div>
                  </div>

                  <button
                    className="w-full py-4 mb-8 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-xs md:text-sm"
                  >
                    View & Download <ArrowRight size={18} />
                  </button>

                  <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl py-3 px-4 flex items-center gap-2.5 border border-emerald-100/50 dark:border-emerald-500/10">
                    <Award size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Verified Asset
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setViewingCertificate(null)}
                  className="absolute top-4 left-4 w-7 h-7 bg-black/30 backdrop-blur text-white rounded-full flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default StudentCourses;