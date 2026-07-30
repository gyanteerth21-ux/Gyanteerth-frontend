import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { Video, Calendar, Clock, PlusCircle, Activity, ShieldCheck, PlayCircle, Archive, Monitor, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API, TRAINER_API } from '../../config';
import LiveSessionCard from '../../components/shared/LiveSessionCard';

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
      
      const forceEndThresh = new Date(endTime.getTime() + 2 * 60 * 60 * 1000);
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



  const currentList = activeTab === 'live' ? liveSessions : (activeTab === 'upcoming' ? upcomingSessions : passedSessions);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Live <span style={{ color: '#4f46e5' }}>Broadcasts</span>
          </h1>
          <p style={{ margin: 0, maxWidth: '600px', fontSize: '1.1rem', color: 'var(--color-text-muted)', fontWeight: 500, lineHeight: 1.6 }}>
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
        background: 'var(--color-surface-muted)', padding: '0.5rem', 
        borderRadius: '1.5rem', width: 'fit-content', border: '1px solid var(--color-border)' 
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
              background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ 
                background: tab.id === 'live' ? '#ef4444' : (activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)'), 
                color: tab.id === 'live' ? 'white' : 'var(--color-bg)', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '1rem',
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
            <LiveSessionCard key={s.live_id} session={s} type={activeTab} idx={i} role="trainer" />
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

export default LiveSessions;