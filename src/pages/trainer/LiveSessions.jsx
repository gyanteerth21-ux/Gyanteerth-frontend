import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { Video, Calendar, Clock, PlusCircle, Activity, ShieldCheck, PlayCircle, Archive, Monitor, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API, TRAINER_API } from '../../config';

const LiveSessions = () => {
  const { user, smartFetch } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchSessions = useCallback(async () => {
    const identifier = user?.user_id || user?.id || user?.email;
    if (!identifier) return;

    try {
      // 1. Get trainer's course IDs (SWR enabled)
      const data = await smartFetch(`${TRAINER_API}/trainer_course_ids`, {
         cacheKey: `trainer_course_ids_${identifier}`
      });
      const ids = data?.course_ids || [];

      if (ids.length === 0) { setLoading(false); return; }

      // 2. Fetch full-details for each course (SWR enabled with shared keys)
      const results = await Promise.all(
        ids.map(id => smartFetch(`${ADMIN_API}/course/${id}/full-details`, { cacheKey: `details_${id}` }))
      );

      const allSessions = [];
      results.forEach((courseData, i) => {
        if (!courseData) return;
        const c = courseData.course || courseData;
        const courseTitle = c.course_title || c.title || `Course ${ids[i]}`;

        (c.modules || []).forEach(m => {
          (m.content?.live_sessions || m.live_sessions || []).forEach(ls => {
            allSessions.push({
              live_id: ls.live_id || ls.Live_ID,
              course_id: ids[i],
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
      console.error('Live session sync failure', err);
    } finally {
      setLoading(false);
    }
  }, [user, smartFetch]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Same filtering logic as student panel — time-based, not status-based
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

  // Auto-select the best tab based on what has data
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
    const accent = isLive ? '#ef4444' : (isHistory ? '#64748b' : '#4f46e5');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: idx * 0.05 }}
        style={{ 
          background: 'white', 
          borderRadius: '1.5rem', 
          padding: '1.5rem 2rem', 
          border: `1px solid ${isLive ? 'rgba(239,68,68,0.15)' : '#f1f5f9'}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '2rem',
          boxShadow: isLive ? '0 10px 30px rgba(239,68,68,0.08)' : '0 4px 20px rgba(0,0,0,0.02)',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = isLive ? '0 10px 30px rgba(239,68,68,0.08)' : '0 4px 20px rgba(0,0,0,0.02)';
        }}
      >
        <div style={{ flex: '2 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ 
              padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
              background: `${accent}15`, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {isLive ? 'Live Now' : (isHistory ? 'Completed' : 'Upcoming')}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} color="#4f46e5" /> {session.course_title}
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{session.title}</h3>
        </div>

        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <Calendar size={15} color={accent} /> {new Date(session.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} /> {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
          {isLive || !isHistory ? (
            <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.5rem', borderRadius: '1rem', border: 'none',
                  background: isLive ? '#ef4444' : '#4f46e5',
                  color: 'white',
                  fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: isLive ? '0 8px 20px rgba(239,68,68,0.25)' : '0 8px 20px rgba(79,70,229,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {isLive ? <><Video size={18} /> Start Session</> : <><Monitor size={18} /> Open Lobby</>}
              </button>
            </a>
          ) : (
            <button 
              onClick={() => navigate(`/trainer/course/${session.course_id}`)}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.5rem', borderRadius: '1rem', 
                border: 'none',
                background: '#f1f5f9',
                color: '#475569',
                fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <Archive size={18} /> View Details
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const currentList = activeTab === 'live' ? liveSessions : (activeTab === 'upcoming' ? upcomingSessions : passedSessions);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Live <span style={{ color: '#4f46e5' }}>Broadcasts</span>
          </h1>
          <p style={{ margin: 0, maxWidth: '600px', fontSize: '1.1rem', color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>
            Schedule and manage your interactive virtual classes. Track upcoming, live, and past sessions all in one place.
          </p>
        </div>
        <button onClick={() => navigate('/trainer/courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#4f46e5', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '1rem', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.25)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <PlusCircle size={18} /> Schedule Session
        </button>
      </div>

      {/* ── Tab Navigation (same as student panel) ── */}
      <div style={{ 
        display: 'flex', gap: '1rem', marginBottom: '2.5rem', 
        background: 'rgba(226, 232, 240, 0.4)', padding: '0.5rem', 
        borderRadius: '1.5rem', width: 'fit-content', border: '1px solid #e2e8f0' 
      }}>
        {[
          { id: 'live', label: 'Live Now', count: liveSessions.length, color: '#ef4444' },
          { id: 'upcoming', label: 'Upcoming', count: upcomingSessions.length, color: '#4f46e5' },
          { id: 'history', label: 'Past Sessions', count: passedSessions.length, color: '#64748b' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.75rem', borderRadius: '1.1rem', border: 'none',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#0f172a' : '#64748b',
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ 
                background: tab.id === 'live' ? '#ef4444' : (activeTab === tab.id ? '#0f172a' : '#cbd5e1'), 
                color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '1rem',
                animation: tab.id === 'live' ? 'pulse 1.5s infinite' : 'none'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '100px', background: 'white', borderRadius: '1.5rem', animation: 'pulse-bg 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '2.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
            <Video size={36} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>No sessions found</h3>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 500, maxWidth: '400px', margin: '0 auto' }}>
            There are no {activeTab === 'live' ? 'live' : activeTab === 'upcoming' ? 'upcoming' : 'past'} sessions in your schedule at the moment.
          </p>
          <button 
            onClick={() => navigate('/trainer/courses')}
            style={{ marginTop: '2rem', padding: '0.85rem 2rem', borderRadius: '1rem', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Go to Courses
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
        @keyframes pulse-bg { 0% { background-color: white; } 50% { background-color: #f8fafc; } 100% { background-color: white; } }
      `}</style>
    </div>
  );
};

export default LiveSessions;