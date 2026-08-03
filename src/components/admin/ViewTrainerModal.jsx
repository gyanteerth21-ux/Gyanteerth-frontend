import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Phone, Calendar, Activity, MapPin } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';

const VItem = ({ icon, label, value }) => (
  <div>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.55rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
        {React.cloneElement(icon, { size: 11, color: '#64748b' })} {label}
     </div>
     <div style={{ fontWeight: 950, color: 'var(--color-text)', fontSize: '0.85rem' }}>{value}</div>
  </div>
);

const ViewTrainerModal = ({ trainer, onClose, origin }) => {
  const { authFetch } = useAuth();

  const isInactive = trainer.trainer_status === 'inactive';
  const name = trainer.user_name || (trainer.email || '').split('@')[0] || 'Unknown';
  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.45)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
       <motion.div 
          initial={{ opacity: 0, scale: 0.1, x: origin?.x - (window.innerWidth / 2) || 0, y: origin?.y - (window.innerHeight / 2) || 0 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.1, x: origin?.x - (window.innerWidth / 2) || 0, y: origin?.y - (window.innerHeight / 2) || 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={{ width: 'min(95vw, 450px)', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: '2.5rem', boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.4)', border: '1px solid var(--color-border)' }}
          onClick={(e) => e.stopPropagation()}
          className="no-scrollbar"
       >
          <header style={{ padding: '1rem 1.75rem', background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Faculty Node Trace</span>
             <button onClick={onClose} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', width: '2rem', height: '2rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16}/></button>
          </header>
          <div style={{ padding: '2rem 2.5rem', textAlign: 'center' }}>
             <motion.div 
               initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', damping: 20 }}
               style={{ width: '5.5rem', height: '5.5rem', borderRadius: '1.75rem', background: isInactive ? 'linear-gradient(135deg, #fecaca, #f87171)' : 'linear-gradient(135deg, #a7f3d0, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '2.5rem', color: '#fff', margin: '0 auto 1.25rem', boxShadow: isInactive ? '0 10px 25px -5px rgba(239, 68, 68, 0.4)' : '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
                {name.charAt(0).toUpperCase()}
             </motion.div>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: isInactive ? '#ef4444' : '#10b981', fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', boxShadow: `0 0 10px currentColor` }} />
                {isInactive ? 'Access Restricted' : 'Active Faculty Member'}
             </div>
             <h3 style={{ fontSize: '1.65rem', fontWeight: 950, margin: 0, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>{trainer.trainer_name || name}</h3>
             <p style={{ color: 'var(--color-text-muted)', fontWeight: 800, marginTop: '0.35rem', marginBottom: '2rem', fontSize: '0.9rem' }}>{trainer.trainer_email || trainer.email}</p>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '1.75rem', border: '1px solid var(--color-border)', textAlign: 'left', marginBottom: '2rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                <VItem icon={<Phone size={14} color="#3b82f6" />} label="Phone Contact" value={trainer.user_number || trainer.trainer_number || '—'} />
                <VItem icon={<Calendar size={14} color="#f97316" />} label="Date of Birth" value={trainer.user_dob || trainer.trainer_dob || '—'} />
                <VItem icon={<Activity size={14} color="#8b5cf6" />} label="Gender" value={trainer.user_gender || trainer.trainer_gender || '—'} />
                <VItem icon={<MapPin size={14} color="#10b981" />} label="Location Hub" value={`${trainer.user_city || trainer.trainer_city || '—'}${trainer.trainer_state ? `, ${trainer.trainer_state}` : ''}`} />
             </div>

             <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.85rem' }}>Dismiss Review</button>
          </div>
       </motion.div>
    </div>
  );
  return createPortal(modalContent, document.body);
};

export default ViewTrainerModal;
