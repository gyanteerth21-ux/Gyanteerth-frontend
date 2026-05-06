import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { useEnrollment } from '../../shared/EnrollmentContext';
import { Video, Calendar, Clock, Activity, ShieldCheck, PlayCircle, Archive, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API } from '../../config';

const LiveSessionTracker = ({ limit = 3 }) => {
  const { user, smartFetch } = useAuth();
  const { enrolledCourses } = useEnrollment();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      // Buffer of 4 hours after end time before we forcefully consider it passed, 
      // even if the backend still says 'live'.
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

  const SessionItem = ({ session, type, idx }) => {
    const isLive = type === 'live';
    const isPassed = type === 'passed';
    const accent = isLive ? '#ef4444' : (isPassed ? '#64748b' : '#f97316');

    return (
      <motion.div 
        initial={{ opacity: 0, x: 10 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: idx * 0.1 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.75rem', 
          background: isLive ? 'rgba(239, 68, 68, 0.03)' : '#f8fafc', 
          borderRadius: '1.25rem', 
          padding: '1.25rem', 
          border: `1px solid ${isLive ? 'rgba(239, 68, 68, 0.1)' : '#f1f5f9'}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isLive && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session.title}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={12} color="#059669" /> {session.course_title}
            </div>
          </div>
          <div style={{ 
            fontSize: '0.65rem', fontWeight: 900, padding: '0.25rem 0.6rem', borderRadius: '99px',
            background: `${accent}15`, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em',
            border: `1px solid ${accent}25`
          }}>
            {isLive ? 'Live' : (isPassed ? 'Ended' : 'Soon')}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} color={accent} /> {new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} /> {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <button 
            onClick={() => navigate(`/student/course/${session.course_id}`)}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '32px', height: '32px', borderRadius: '10px', 
              background: isLive ? '#ef4444' : '#0f172a', color: 'white',
              border: 'none', cursor: 'pointer', boxShadow: isLive ? '0 4px 12px rgba(239, 68, 68, 0.2)' : 'none'
            }}
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div style={{ background: '#0f172a', borderRadius: '2.5rem', padding: '2.5rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ height: '24px', width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '80px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '1.25rem', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '80px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '1.25rem', animation: 'pulse 1.5s infinite' }} />
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  const allFiltered = [...liveSessions, ...upcomingSessions].slice(0, limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Tracker Hero Card */}
      <div style={{ background: '#0f172a', borderRadius: '2.5rem', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}>
                <Video size={20} color="#f97316" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Live Tracker</h3>
            </div>
            {liveSessions.length > 0 && (
              <span style={{ 
                background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 950, 
                padding: '0.25rem 0.6rem', borderRadius: '99px', animation: 'pulse-red 2s infinite' 
              }}>
                LIVE NOW
              </span>
            )}
          </div>

          {allFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0' }}>
                No live sessions found in your curriculum.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {liveSessions.length > 0 && (
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={14} /> Active Classes
                </div>
              )}
              {liveSessions.slice(0, 2).map((s, idx) => (
                <SessionItem key={s.live_id} session={s} type="live" idx={idx} />
              ))}

              {upcomingSessions.length > 0 && (liveSessions.length < limit) && (
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} /> Upcoming
                </div>
              )}
              {upcomingSessions.slice(0, limit - liveSessions.length).map((s, idx) => (
                <SessionItem key={s.live_id} session={s} type="upcoming" idx={idx + liveSessions.length} />
              ))}

              {allFiltered.length > 0 && (
                <button 
                  onClick={() => navigate('/student/courses')}
                  style={{ 
                    marginTop: '0.5rem', width: '100%', background: 'rgba(255,255,255,0.05)', 
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '0.75rem', borderRadius: '1.25rem', fontWeight: 800, 
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  View Full Schedule <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
        <style>{`
          @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}</style>
      </div>

    </div>
  );
};

export default LiveSessionTracker;
