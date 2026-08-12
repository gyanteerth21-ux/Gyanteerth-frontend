import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, UserCheck, UserX, Phone, MapPin, ArrowRight } from 'lucide-react';

const LInfo = ({ icon, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>
     {React.cloneElement(icon, { size: 12 })} <span>{value}</span>
  </div>
);

const CInfo = ({ icon, label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.55rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {React.cloneElement(icon, { size: 10, color: '#64748b' })} {label}
     </div>
     <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
  </div>
);

export const PremiumUserCard = ({ trainer, onView, onEdit, onToggle, isActionLoading, index }) => {
  const isInactive = trainer.trainer_status === 'inactive';
  const name = trainer.user_name || (trainer.email || '').split('@')[0] || 'Unknown';
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }}
      style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.75rem', padding: '1.5rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }} 
      className="premium-glow-card"
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
             <div style={{ 
                width: '3rem', height: '3rem', borderRadius: '0.85rem', background: isInactive ? '#fee2e2' : '#dcfce7', color: isInactive ? '#ef4444' : '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '1.1rem', border: `1px solid ${isInactive ? '#fecaca' : '#bbf7d0'}`
             }}>
                {name.charAt(0).toUpperCase()}
             </div>
             <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 950, color: isInactive ? '#ef4444' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                   <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                   {isInactive ? 'Inactive' : 'Active'}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>{name}</h3>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                   {trainer.email || 'No email provided'}
                </div>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
             <button onClick={onEdit} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={14}/></button>
             <button onClick={onToggle} disabled={isActionLoading} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: isInactive ? '#dcfce7' : '#fee2e2', border: `1px solid ${isInactive ? '#bbf7d0' : '#fecaca'}`, color: isInactive ? '#10b981' : '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isInactive ? <UserCheck size={16} /> : <UserX size={16} />}
             </button>
          </div>
       </div>
       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <CInfo icon={<Phone size={12} />} label="Mobile" value={trainer.user_number || '—'} />
          <CInfo icon={<MapPin size={12} />} label="Location" value={trainer.user_city || '—'} />
       </div>
       <div style={{ padding: '0 0.5rem' }}>
          <button onClick={(e) => onView(e)} className="btn btn-ghost" style={{ width: '100%', padding: '0.75rem', borderRadius: '1.15rem', fontSize: '0.85rem', fontWeight: 900, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
             Details <ArrowRight size={14} />
          </button>
       </div>
    </motion.div>
  );
};

export const PremiumUserListRow = ({ trainer, onView, onEdit, onToggle, index }) => {
  const isInactive = trainer.trainer_status === 'inactive';
  const name = trainer.user_name || (trainer.email || '').split('@')[0] || 'Unknown';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }}
      style={{ backgroundColor: 'var(--color-surface)', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}
    >
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.7rem', background: isInactive ? '#fee2e2' : '#dcfce7', color: isInactive ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem', border: `1px solid ${isInactive ? '#fecaca' : '#bbf7d0'}` }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h4>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
               <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isInactive ? '#ef4444' : '#10b981' }} />
               <span style={{ fontWeight: 800 }}>{trainer.email}</span>
            </div>
          </div>
       </div>
       <div className="hide-on-mobile" style={{ display: 'flex', gap: '1.5rem', flex: 1.5 }}>
          <LInfo icon={<Phone size={13} />} value={trainer.user_number || '—'} />
          <LInfo icon={<MapPin size={13} />} value={trainer.user_city || '—'} />
       </div>
       <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={(e) => onView(e)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontWeight: 900, color: 'var(--color-text)', fontSize: '0.8rem', cursor: 'pointer' }}>View Details</button>
          <button onClick={onEdit} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={16}/></button>
       </div>
    </motion.div>
  );
};
