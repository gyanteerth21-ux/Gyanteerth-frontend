import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, Mail, User, Fingerprint, Calendar, Phone, Users, Globe, MapPin, Loader2, Save } from 'lucide-react';

const Input = ({ label, error, icon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
     <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{icon && React.cloneElement(icon, { size: 14 })} {label}</label>
     <div style={{ position: 'relative' }}>
        <input {...props} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1px solid ${error ? '#ef4444' : 'var(--color-border-strong)'}`, background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }} />
        {error && <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 950 }}>{error}</div>}
     </div>
  </div>
);

const TrainerFormModal = ({ title, trainer, onClose, onSubmit, loading, isCreate, validateMobile, validatePassword, showToast }) => {
  const [form, setForm] = useState({
    user_id: trainer?.user_id || '',
    trainer_email: trainer?.email || trainer?.trainer_email || '',
    trainer_name: trainer?.user_name || trainer?.trainer_name || '',
    trainer_number: trainer?.user_number || trainer?.trainer_number || '',
    trainer_pass: '',
    trainer_dob: trainer?.user_dob || trainer?.trainer_dob || '',
    trainer_gender: trainer?.user_gender || trainer?.trainer_gender || '',
    trainer_city: trainer?.user_city || trainer?.trainer_city || '',
    trainer_state: trainer?.user_state || trainer?.trainer_state || ''
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  const handleAction = (e) => {
    e.preventDefault();
    const localErrors = {};
    if (!validateMobile(form.trainer_number)) localErrors.trainer_number = '10 digits required';
    if (isCreate || (form.trainer_pass && form.trainer_pass !== '')) {
       if (!validatePassword(form.trainer_pass)) localErrors.trainer_pass = 'Strong key required';
    }
    if (Object.keys(localErrors).length > 0) { setErrors(localErrors); return; }
    onSubmit(form);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
       <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} style={{ width: 'clamp(320px, 95vw, 850px)', backgroundColor: 'var(--color-surface)', borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)' }}>
          <header style={{ padding: '1.5rem 2rem', background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.2rem' }}>
                   <Zap size={14} fill="var(--color-primary)" /> Trainer Node
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950 }}>{isCreate ? 'Add Trainer' : 'Edit Profile'}</h2>
             </div>
             <button onClick={onClose} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', width: '2rem', height: '2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}><X size={16}/></button>
          </header>
          <form onSubmit={handleAction} style={{ padding: '1.5rem 2rem', maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }} className="no-scrollbar">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <Input label="Email Identity" name="trainer_email" type="email" value={form.trainer_email} onChange={handleChange} required disabled={!isCreate} icon={<Mail size={16} />} />
                <Input label="Display Name" name="trainer_name" value={form.trainer_name} onChange={handleChange} required placeholder="Trainer Name" icon={<User size={16} />} />
                <Input label="Auth Key" name="trainer_pass" type="password" value={form.trainer_pass} onChange={handleChange} required={isCreate} placeholder="••••••••" error={errors.trainer_pass} icon={<Fingerprint size={16} />} />
                <Input label="Birth Date" name="trainer_dob" type="date" value={form.trainer_dob} onChange={handleChange} required icon={<Calendar size={16} />} />
                <Input label="Contact Line" name="trainer_number" value={form.trainer_number} onChange={handleChange} required error={errors.trainer_number} icon={<Phone size={16} />} />
                <div>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.7rem' }}><Users size={14} /> Gender Status</label>
                   <select name="trainer_gender" value={form.trainer_gender} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Select Protocol</option><option value="male">Male</option><option value="female">Female</option>
                   </select>
                </div>
                <Input label="City Hub" name="trainer_city" value={form.trainer_city} onChange={handleChange} required icon={<Globe size={16} />} />
                <Input label="State Region" name="trainer_state" value={form.trainer_state} onChange={handleChange} required icon={<MapPin size={16} />} />
             </div>
             <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.65rem 1.5rem', borderRadius: '0.75rem' }}>Discard Changes</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.65rem 2rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   {isCreate ? 'Initialize Faculty' : 'Commit Profile'}
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
};

export default TrainerFormModal;
