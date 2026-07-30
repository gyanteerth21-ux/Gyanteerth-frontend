import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Trash } from 'lucide-react';

export const SubTab = ({ active, icon, label, onClick, color }) => (
  <button onClick={onClick} style={{ padding: '0.55rem 1.15rem', border: 'none', borderRadius: '1.15rem', backgroundColor: active ? 'var(--color-surface)' : 'transparent', color: active ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 950, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.55rem', boxShadow: active ? 'var(--shadow-sm)' : 'none' }}>
    <span style={{ color: active ? color : 'inherit' }}>{icon}</span> {label}
  </button>
);

export const ContentItem = ({ icon, title, sub, color, onEdit, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    style={{ padding: '0.85rem 1.25rem', borderRadius: '1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}
    className="premium-card"
  >
    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button onClick={onEdit} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={14} /></button>
      <button onClick={onDelete} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: '#fff1f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash size={14} /></button>
    </div>
  </motion.div>
);

export const AMInput = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <input {...props} style={{ padding: '0.85rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', backgroundColor: 'var(--color-bg)', outline: 'none', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', transition: 'all 0.2s' }} />
  </div>
);

export const AMTextarea = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <textarea {...props} style={{ padding: '0.85rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', backgroundColor: 'var(--color-bg)', outline: 'none', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', transition: 'all 0.2s', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }} />
  </div>
);

export const AMSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <select value={value} onChange={onChange} style={{ padding: '0.85rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-bg)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', cursor: 'pointer' }}>
      {options.map(o => typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
  </div>
);

export const EmptyPlaceholder = ({ label }) => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 950, fontSize: '0.9rem', letterSpacing: '0.05em' }}>{label?.toUpperCase()}</div>
);
