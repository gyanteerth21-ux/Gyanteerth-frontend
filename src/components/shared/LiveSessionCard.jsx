import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, ShieldCheck, Archive, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveSessionCard = ({ session, type, idx, role = 'student' }) => {
  const navigate = useNavigate();
  const isLive = type === 'live';
  const isHistory = type === 'history';
  const accent = isLive ? '#ef4444' : (isHistory ? '#64748b' : (role === 'trainer' ? '#4f46e5' : '#6366f1'));

  const getButtonConfig = () => {
    if (role === 'trainer') {
      return {
        liveIcon: <Video size={18} />,
        liveText: 'Start Session',
        liveBg: '#ef4444',
        liveColor: 'white',
        upcomingBg: '#4f46e5',
        upcomingText: 'Open Lobby',
        upcomingIcon: <Monitor size={18} />,
        historyBg: 'var(--color-surface-muted)',
        historyColor: 'var(--color-text-muted)',
        historyText: 'View Details',
        historyIcon: <Archive size={18} />,
        navUrl: `/trainer/course/${session.course_id}`
      };
    }
    return {
      liveIcon: <Video size={18} />,
      liveText: 'Join Session',
      liveBg: '#ef4444',
      liveColor: 'white',
      upcomingBg: 'var(--color-text)',
      upcomingText: 'Open Classroom',
      upcomingIcon: <Monitor size={18} />,
      historyBg: 'var(--color-surface-muted)',
      historyColor: 'var(--color-text-muted)',
      historyText: 'Watch Recording',
      historyIcon: <Archive size={18} />,
      navUrl: `/student/course/${session.course_id}`
    };
  };

  const config = getButtonConfig();

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
        flexWrap: 'wrap',
        alignItems: 'center',
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
      <div className="flex-1 min-w-0" style={{ flex: '2 1 300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ 
            padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
            background: `${accent}15`, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {isLive ? 'Live Now' : (isHistory ? 'Completed' : 'Upcoming')}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} color={role === 'trainer' ? "#4f46e5" : "#059669"} /> {session.course_title}
          </div>
        </div>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>{session.title}</h3>
      </div>

      <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Calendar size={15} color={accent} /> {new Date(session.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={15} /> {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div style={{ flex: '0 0 auto', textAlign: 'right' }} className="mt-2 md:mt-0">
        {isLive || !isHistory ? (
          <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.5rem', borderRadius: '1rem', border: 'none',
                background: isLive ? config.liveBg : config.upcomingBg,
                color: isLive ? config.liveColor : (role === 'student' ? 'var(--color-bg)' : 'white'),
                fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: isLive ? '0 8px 20px rgba(239,68,68,0.25)' : (role === 'trainer' ? '0 8px 20px rgba(79,70,229,0.2)' : 'none'),
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {isLive ? <>{config.liveIcon} {config.liveText}</> : <>{config.upcomingIcon} {config.upcomingText}</>}
            </button>
          </a>
        ) : (
          <button 
            onClick={() => navigate(config.navUrl)}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1.5rem', borderRadius: '1rem', 
              border: 'none',
              background: config.historyBg,
              color: config.historyColor,
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = config.historyBg; }}
          >
            {config.historyIcon} {config.historyText}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default LiveSessionCard;
