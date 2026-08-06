import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trash2, Settings2, BookOpen, Clock, Award, BarChart3, Edit } from 'lucide-react';

const ASInfo = ({ icon, label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{icon} {label}</div>
     <div style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--color-text)' }}>{value}</div>
  </div>
);

export const PremiumAssessmentCard = ({ asm, onDelete, onEdit, onManage, index, setViewingResults }) => {
  const status = asm.status || asm.Status;
  const isSuspended = status === 'inactive';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.25rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
      className="premium-glow-card"
    >
       <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle at 100% 0%, #f9731608 0%, transparent 60%)', pointerEvents: 'none' }} />
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
             <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', border: '1px solid #ffedd5' }}>
                <Target size={18} />
             </div>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>

                    {(asm.course_status === 'inactive') && (
                       <span style={{ fontSize: '0.45rem', background: '#ef4444', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '0.35rem', fontWeight: 900 }}>INACTIVE COURSE</span>
                    )}
                 </div>
                 <h3 style={{ margin: 0, fontSize: '1rem' }}>{asm.title || asm.Title}</h3>
              </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
             <button onClick={onEdit} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={12}/></button>
             <button onClick={onDelete} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: '#fff1f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={12}/></button>
          </div>
       </div>

       <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-text)' }}>{asm.course_title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
             <BookOpen size={12} color="var(--color-text-light)" />
             <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{asm.module_title}</span>
          </div>
       </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.85rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <ASInfo icon={<Clock size={12} color="#3b82f6"/>} label="Limit" value={`${asm.duration}m`} />
          <ASInfo icon={<Award size={12} color="#f97316"/>} label="Target" value={`${asm.passing_mark}/${asm.total_mark}`} />
       </div>

        <button onClick={onManage} className="btn btn-ghost" style={{ width: '100%', padding: '0.65rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 800 }}>
           Assessment Design <Settings2 size={14} />
        </button>

        <button 
          onClick={() => setViewingResults(asm)}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: '#0f172a', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 900, cursor: 'pointer' }}
        >
          <BarChart3 size={18} /> Analyze Results
        </button>
    </motion.div>
  );
};

export const PremiumAssessmentListRow = ({ asm, onDelete, onEdit, onManage, index, setViewingResults }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
    className="premium-glow-card"
    style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem 2rem', borderRadius: '1.75rem', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
  >
     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1.5 }}>
        <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '1rem', backgroundColor: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Target size={22} />
        </div>
        <div>
           <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {asm.title || asm.Title}
              {asm.course_status === 'inactive' && (
                <span style={{ fontSize: '0.45rem', background: '#ef4444', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '0.35rem', fontWeight: 900 }}>INACTIVE</span>
              )}
           </h4>
           <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{asm.module_title} • {asm.course_title}</div>
        </div>
     </div>

     <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Clock size={14} color="#3b82f6" />
           <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{asm.duration}m</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Award size={14} color="#f97316" />
           <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{asm.passing_mark}/{asm.total_mark}</span>
        </div>
     </div>

     <div style={{ display: 'flex', gap: '0.75rem' }}>
         <button 
           onClick={() => setViewingResults(asm)}
           style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', background: '#0f172a', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
         >
           <BarChart3 size={14} /> Results
         </button>
         <button onClick={onManage} style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Design</button>
        <button onClick={onEdit} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={16}/></button>
        <button onClick={onDelete} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', background: '#fff1f2', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16}/></button>
     </div>
  </motion.div>
);
