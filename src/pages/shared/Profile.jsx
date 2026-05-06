import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Activity, 
  Briefcase, Save, Camera, Loader2, CheckCircle2, 
  AlertCircle, ChevronRight, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { USER_API, TRAINER_API } from '../../config';

const Profile = () => {
  const { user, authFetch, login, clearCache } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    number: '',
    dob: '',
    gender: '',
    city: '',
    state: '',
    expertise: '', // for trainers
    pic: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const endpoint = user.role === 'trainer' ? `${TRAINER_API}/profile` : `${USER_API}/profile`;
        const res = await authFetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.user_name || data.trainer_name || user.name || '',
            email: data.email || data.trainer_email || user.email || '',
            number: data.user_number || data.trainer_number || '',
            dob: data.user_dob || data.trainer_dob || '',
            gender: data.user_gender || data.trainer_gender || '',
            city: data.user_city || data.trainer_city || '',
            state: data.user_state || data.trainer_state || '',
            expertise: data.trainer_expertise || '',
            pic: data.user_pic || data.pic || user.pic || null
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setFetching(false);
      }
    };

    if (user) fetchProfile();
  }, [user, authFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isTrainer = user.role === 'trainer';
      const endpoint = isTrainer ? `${TRAINER_API}/update-trainer` : `${USER_API}/profile`;
      
      // For trainers, backend expects specific keys based on AdminUsers logic
      const payload = isTrainer ? {
        trainer_email: form.email,
        trainer_name: form.name,
        trainer_number: form.number,
        trainer_dob: form.dob,
        trainer_gender: form.gender,
        trainer_city: form.city,
        trainer_state: form.state,
        trainer_expertise: form.expertise
      } : {
        user_name: form.name,
        user_number: form.number,
        user_dob: form.dob,
        user_gender: form.gender,
        user_city: form.city,
        user_state: form.state
      };

      const res = await authFetch(endpoint, {
        method: isTrainer ? 'PUT' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Profile updated successfully');
        // Update local context
        login({ ...user, name: form.name, pic: form.pic });
        if (isTrainer) clearCache('admin_all_trainers');
      } else {
        const errorData = await res.json();
        const errorMsg = Array.isArray(errorData.detail) 
          ? errorData.detail[0]?.msg || 'Validation error'
          : typeof errorData.detail === 'object' 
            ? JSON.stringify(errorData.detail)
            : errorData.detail || 'Update failed';
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('profile_pic', file);
    
    // Use the email as identifier if needed by backend, or just hit the endpoint
    const endpoint = user.role === 'trainer' 
      ? `${TRAINER_API}/update-profile-pic` 
      : `${USER_API}/profile-pic`;

    try {
      setLoading(true);
      const res = await authFetch(endpoint, {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        const data = await res.json();
        const newPic = data.pic_url || data.pic;
        setForm(prev => ({ ...prev, pic: newPic }));
        login({ ...user, pic: newPic });
        showToast('Profile picture updated');
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={48} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* ── Header Section ── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          <User size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Personal Identity</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>Account Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>Manage your professional presence and personal data</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* ── Left Column: Avatar & Quick Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: '2.5rem', padding: '2.5rem', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem', borderRadius: '2.5rem', overflow: 'hidden', border: '4px solid var(--color-surface-muted)', boxShadow: 'var(--shadow-md)' }}>
              {form.pic ? (
                <img src={form.pic} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 900 }}>
                  {form.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <input type="file" onChange={handlePicUpload} style={{ display: 'none' }} accept="image/*" />
                <Camera size={24} />
              </label>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--color-text)' }}>{form.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>{user.role === 'trainer' ? 'Expert Faculty' : 'Premium Student'}</p>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                <Mail size={14} /> <span>{form.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                <Activity size={14} /> <span>{user.role?.toUpperCase()} NODE</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface-muted)', borderRadius: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
             <h4 style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Identity Status</h4>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
               <CheckCircle2 size={16} /> Verified Account
             </div>
          </div>
        </div>

        {/* ── Right Column: Update Form ── */}
        <form onSubmit={handleUpdate} style={{ background: 'var(--color-surface)', borderRadius: '2.5rem', padding: '3rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            <ProfileInput label="Full Display Name" name="name" value={form.name} onChange={handleChange} icon={<User size={18} />} required />
            <ProfileInput label="Contact Number" name="number" value={form.number} onChange={handleChange} icon={<Phone size={18} />} required />
            <ProfileInput label="Birth Date" name="dob" type="date" value={form.dob} onChange={handleChange} icon={<Calendar size={18} />} />
            
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                Gender Protocol
              </label>
              <div style={{ position: 'relative' }}>
                <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select Identity</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <Activity size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            <ProfileInput label="City Hub" name="city" value={form.city} onChange={handleChange} icon={<Globe size={18} />} />
            <ProfileInput label="State/Region" name="state" value={form.state} onChange={handleChange} icon={<MapPin size={18} />} />

            {user.role === 'trainer' && (
              <div style={{ gridColumn: 'span 2' }}>
                <ProfileInput label="Area of Expertise" name="expertise" value={form.expertise} onChange={handleChange} icon={<Briefcase size={18} />} placeholder="e.g. Full Stack Development, Cloud Architecture" />
              </div>
            )}
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1.25rem 3rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Synchronizing...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000 }}>
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ padding: '1.15rem 2.5rem', borderRadius: '1.25rem', backgroundColor: '#111827', color: 'white', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} color="var(--color-primary)" /> : <AlertCircle size={20} color="#ef4444" />}
            {toast.message}
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ProfileInput = ({ label, icon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input {...props} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
      <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
        {icon}
      </div>
    </div>
  </div>
);

export default Profile;
