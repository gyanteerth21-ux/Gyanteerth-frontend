import React from 'react';
import { Users, BarChart2, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { optimizeImageUrl } from '../../config';

const getTypeColor = (type) => {
  if (!type) return { bg: '#f8f7ff', text: '#6366f1', label: 'Recorded' };
  const t = type.toLowerCase();
  if (t === 'live' || t === 'live_course' || t === 'live session') return { bg: '#fef2f2', text: '#ef4444', label: 'Live' };
  return { bg: '#f0fdf4', text: '#10b981', label: 'Recorded' };
};

const TrainerCourseCard = ({ course }) => {
  const navigate = useNavigate();
  const typeStyle = getTypeColor(course.course_type || course.type);

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      style={{ 
        display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', 
        backgroundColor: 'var(--color-surface)', border: '1px solid #f1f5f9', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: '180px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
        <img 
          src={optimizeImageUrl(course.thumbnail)} 
          alt={course.course_title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          background: typeStyle.bg, color: typeStyle.text,
          padding: '0.35rem 0.85rem', borderRadius: '2rem',
          fontSize: '0.7rem', fontWeight: 900, backdropFilter: 'blur(8px)',
          border: `1px solid ${typeStyle.text}30`, textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          {typeStyle.label}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.course_title}
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', alignItems: 'center', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={16} color="#4f46e5" /> {course.studentCount} Students
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BarChart2 size={16} color="#10b981" /> {course.level || 'Intermediate'}
          </span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Avg. Engagement</span>
            <span style={{ fontWeight: 800, color: '#4f46e5' }}>{course.avgProgress}%</span>
          </div>
          <div style={{ width: '100%', background: 'var(--color-border)', height: '8px', borderRadius: '99px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${course.avgProgress}%` }} transition={{ duration: 1 }} style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8)', height: '100%', borderRadius: '99px' }} />
          </div>

          <button 
            onClick={() => navigate(`/trainer/course/${course.course_id}`)}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#4f46e5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}
          >
            <PlayCircle size={18} /> View Content
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainerCourseCard;
