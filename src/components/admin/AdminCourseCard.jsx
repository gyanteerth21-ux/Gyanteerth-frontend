import React from 'react';
import { ShieldCheck, ArrowRight, Settings, Trash2, Users, Layers } from 'lucide-react';
import { optimizeImageUrl } from '../../config';

const MinStat = ({ icon, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
     <div style={{ width: '2rem', height: '2rem', borderRadius: '0.65rem', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>{icon}</div>
     <span style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--color-text)' }}>{value}</span>
  </div>
);

const AdminCourseCard = ({ course, onEdit, onDelete, onManage, onPublish, isPublishing }) => {
  const isDraft = course.status === 'draft';
  const isLive = course.status === 'active';

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', transition: 'all 0.4s', position: 'relative' }} className="premium-glow-card">
       <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
          <img src={optimizeImageUrl(course.thumbnail)} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
          
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
             <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.65rem', backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={14}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.65rem', backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14}/></button>
          </div>
 
          <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
             {isDraft ? (
                <div style={{ backgroundColor: 'rgba(249,115,22,0.9)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.45rem 1rem', borderRadius: '0.75rem', fontWeight: 950, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                   DRAFT
                </div>
             ) : (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.45rem 1rem', borderRadius: '0.75rem', fontWeight: 950, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                   ACTIVE
                </div>
             )}
          </div>
       </div>
 
       <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
             <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: 'var(--color-text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.course_title}</h3>
             <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.4, height: '2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.course_description}</p>
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
             <MinStat icon={<Users size={12} color="#3b82f6"/>} value={course.students_count || 0} />
             <MinStat icon={<Layers size={12} color="#f97316"/>} value={`${course.modules?.length || 0} Layers`} />
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: isDraft ? '1fr 1fr' : '1fr', gap: '0.75rem', marginTop: 'auto' }}>
             {isDraft && (
                <button onClick={onPublish} disabled={isPublishing} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                   <ShieldCheck size={14} /> Publish
                </button>
             )}
             <button onClick={onManage} style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                Studio Architect <ArrowRight size={14} />
             </button>
          </div>
       </div>
    </div>
  );
};

export default AdminCourseCard;
