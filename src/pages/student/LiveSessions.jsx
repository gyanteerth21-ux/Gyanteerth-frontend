import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { useEnrollment } from '../../shared/EnrollmentContext';
import { Video, Calendar, Clock, Activity, ShieldCheck, PlayCircle, Archive, ExternalLink, ChevronRight, Monitor, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API } from '../../config';

const StudentLiveSessions = () => {
  const { user, smartFetch } = useAuth();
  const { enrolledCourses } = useEnrollment();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'live', 'upcoming', 'history'

  const fetchSessions = useCallback(async () => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Fetch full-details for all enrolled courses to get live sessions
      const results = await Promise.all(
        enrolledCourses.map(c => smartFetch(`${ADMIN_API}/course/${c.id || c.course_id}/full-details`, { cacheKey: `details_${c.id || c.course_id}` }))
      );

      const allSessions = [];
      results.forEach((courseData, i) => {
        if (!courseData) return;
        const c = courseData.course || courseData;
        const courseTitle = c.course_title || c.title || enrolledCourses[i].title;
        const courseId = enrolledCourses[i].id || enrolledCourses[i].course_id;

        (c.modules || []).forEach(m => {
          (m.content?.live_sessions || m.live_sessions || []).forEach(ls => {
            allSessions.push({
              live_id: ls.live_id || ls.Live_ID,
              course_id: courseId,
              moduleId: m.module_id,
              course_title: courseTitle,
              title: ls.title || ls.Title || 'Live Session',
              meeting_url: ls.meeting_url || ls.Meeting_URL,
              start_time: ls.start_time || ls.Start_time,
              end_time: ls.end_time || ls.End_time,
              status: ls.status || ls.Status || 'scheduled',
              provider: ls.provider || ls.Provider
            });
          });
        });
      });

      setSessions(allSessions);
    } catch (err) {
      console.error('Student live session sync failure', err);
    } finally {
      setLoading(false);
    }
  }, [enrolledCourses, smartFetch]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const { liveSessions, upcomingSessions, passedSessions } = useMemo(() => {
    const now = new Date();
    const groups = { liveSessions: [], upcomingSessions: [], passedSessions: [] };
    
    (sessions || []).forEach(s => {
      const startTime = new Date(s.start_time);
      const endTime = new Date(s.end_time);
      
      const forceEndThresh = new Date(endTime.getTime() + 4 * 60 * 60 * 1000);
      const isLive = (s.status === 'live' && now <= forceEndThresh) || (now >= startTime && now <= endTime);
      const isUpcoming = !isLive && startTime > now;
      
      if (isLive) groups.liveSessions.push(s);
      else if (isUpcoming) groups.upcomingSessions.push(s);
      else groups.passedSessions.push(s);
    });

    groups.liveSessions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    groups.upcomingSessions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    groups.passedSessions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    return groups;
  }, [sessions]);

  // Set default tab based on priority
  useEffect(() => {
    if (!loading) {
      if (liveSessions.length > 0) setActiveTab('live');
      else if (upcomingSessions.length > 0) setActiveTab('upcoming');
      else if (passedSessions.length > 0) setActiveTab('history');
    }
  }, [loading, liveSessions.length, upcomingSessions.length, passedSessions.length]);

  const SessionCard = ({ session, type, idx }) => {
    const isLive = type === 'live';
    const isHistory = type === 'history';
    const accent = isLive ? '#ef4444' : (isHistory ? '#64748b' : '#6366f1');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: idx * 0.05 }}
        style={{ 
          background: 'var(--color-surface)', 
          borderRadius: '1.5rem', 
          padding: '1.25rem 1.5rem', 
          border: `1px solid ${isLive ? 'rgba(239,68,68,0.15)' : 'var(--color-border)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '1.5rem',
          boxShadow: isLive ? '0 10px 30px rgba(239,68,68,0.08)' : 'var(--shadow-sm)',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="flex-col md:flex-row md:items-center md:gap-8"
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = isLive ? '0 10px 30px rgba(239,68,68,0.08)' : 'var(--shadow-sm)';
        }}
      >
        <div className="flex-1 min-w-0">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ 
              padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
              background: `${accent}15`, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {isLive ? 'Live Now' : (isHistory ? 'Completed' : 'Upcoming')}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} color="#059669" /> {session.course_title}
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>{session.title}</h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <Calendar size={15} color={accent} /> {new Date(session.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} /> {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="mt-2 md:mt-0">
           <button 
             onClick={() => navigate(`/student/course/${session.course_id}`)}
             style={{ 
               display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
               padding: '0.75rem 1.5rem', borderRadius: '1rem', border: 'none',
               background: isLive ? '#ef4444' : (isHistory ? 'var(--color-surface-muted)' : 'var(--color-text)'),
               color: isHistory ? 'var(--color-text-muted)' : 'var(--color-bg)',
               fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
               boxShadow: isLive ? '0 8px 20px rgba(239,68,68,0.25)' : 'none',
               transition: 'all 0.2s'
             }}
             onMouseEnter={e => {
                if (!isHistory) e.currentTarget.style.transform = 'scale(1.05)';
             }}
             onMouseLeave={e => {
                if (!isHistory) e.currentTarget.style.transform = 'none';
             }}
           >
             {isLive ? <><Video size={18} /> Join Session</> : (isHistory ? <><Archive size={18} /> Watch Recording</> : <><Monitor size={18} /> Open Classroom</>)}
           </button>
        </div>
      </motion.div>
    );
  };

  const currentList = activeTab === 'live' ? liveSessions : (activeTab === 'upcoming' ? upcomingSessions : passedSessions);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* ── Page Header ── */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl" style={{ fontWeight: 950, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Live <span style={{ color: '#ef4444' }}>Broadcasts</span>
        </h1>
        <p style={{ margin: 0, maxWidth: '600px', fontSize: '1.05rem', color: 'var(--color-text-muted)', fontWeight: 500, lineHeight: 1.6 }}>
          Experience the classroom from anywhere. Join interactive sessions, participate in real-time, and catch up on missed discussions.
        </p>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex bg-[var(--color-surface-muted)] p-1.5 rounded-2xl border border-[var(--color-border)] overflow-x-auto no-scrollbar w-full md:w-fit mb-10">
        <div className="flex gap-2 min-w-max w-full">
          {[
            { id: 'live', label: 'Live Now', count: liveSessions.length, color: '#ef4444' },
            { id: 'upcoming', label: 'Upcoming', count: upcomingSessions.length, color: '#6366f1' },
            { id: 'history', label: 'Past Sessions', count: passedSessions.length, color: '#64748b' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-4 md:px-7 py-3 rounded-xl border-none transition-all flex items-center justify-center gap-2 text-sm font-bold ${
                activeTab === tab.id ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black text-white ${
                  tab.id === 'live' ? 'bg-red-500 animate-pulse' : (activeTab === tab.id ? 'bg-[var(--color-text)] text-[var(--color-bg)]' : 'bg-[var(--color-text-muted)]')
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '100px', background: 'var(--color-surface)', borderRadius: '1.5rem', animation: 'pulse-bg 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--color-surface)', borderRadius: '2.5rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface-muted)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)' }}>
            <Video size={36} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.5rem' }}>No sessions found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', fontWeight: 500, maxWidth: '400px', margin: '0 auto' }}>
            There are no {activeTab} live sessions in your schedule at the moment.
          </p>
          <button 
            onClick={() => navigate('/student/browse')}
            style={{ marginTop: '2rem', padding: '0.85rem 2rem', borderRadius: '1rem', border: 'none', background: '#059669', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Browse New Courses
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {currentList.map((s, i) => (
            <SessionCard key={s.live_id} session={s} type={activeTab} idx={i} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulse-bg { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default StudentLiveSessions;
