import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, Trash2, ArrowRight, Plus as PlusIcon } from 'lucide-react';
import { optimizeImageUrl } from '../../config';

export const PremiumCategoryCard = ({ cat, onEdit, onDelete, onView, onCreateCourse, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{ backgroundColor: 'var(--color-surface)', borderRadius: '2.5rem', padding: 'var(--space-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
    className="premium-glow-card"
  >
     <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle at 100% 0%, var(--color-primary-light)10 0%, transparent 60%)', pointerEvents: 'none' }} />
     
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
           <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={optimizeImageUrl(cat.Thumbnail)} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>
           <div>
              <div style={{ fontSize: '0.55rem', fontWeight: 950, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Stack Domain</div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{cat.Category_Name}</h3>
           </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
           <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={14}/></button>
           <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: '#fff1f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14}/></button>
        </div>
     </div>

     <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, height: '2.7rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {cat.Course_Description}
     </p>

     <div style={{ display: 'flex', gap: '0.65rem', position: 'relative', zIndex: 10 }}>
        <button onClick={onView} className="btn btn-primary" style={{ flex: 1.2, padding: '0.65rem 0.85rem', borderRadius: '1rem' }}>
           Review Stack <ArrowRight size={14} />
        </button>
        <button onClick={onCreateCourse} className="btn btn-ghost" style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
           <PlusIcon size={14} /> Course
        </button>
     </div>
  </motion.div>
);

export const PremiumCategoryListRow = ({ cat, onEdit, onDelete, onView, onCreateCourse, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
    className="premium-glow-card"
    style={{ backgroundColor: 'var(--color-surface)', padding: '1rem 1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', border: '1px solid var(--color-border)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
       <div style={{ width: '3.5rem', height: '3rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <img src={optimizeImageUrl(cat.Thumbnail)} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
       </div>
       <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{cat.Category_Name}</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{cat.Course_Description}</p>
       </div>
    </div>

    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
       <button onClick={onView} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-surface)', fontWeight: 800, color: 'var(--color-text)', cursor: 'pointer' }}>Manage courses</button>
       <button onClick={onCreateCourse} style={{ padding: '0.6rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer' }}><PlusIcon size={16}/> New Course</button>
       <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }} />
       <button onClick={onEdit} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--color-surface-muted)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Settings2 size={16}/></button>
       <button onClick={onDelete} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: 'none', background: '#fff1f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16}/></button>
    </div>
  </motion.div>
);
