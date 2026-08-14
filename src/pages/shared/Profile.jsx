import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../shared/schemas';
import { useAuth } from '../../shared/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Activity, 
  Briefcase, Save, Camera, Loader2, CheckCircle2, 
  AlertCircle, ChevronRight, Globe, BookOpen, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { USER_API, TRAINER_API, optimizeImageUrl } from '../../config';
import { State, City } from 'country-state-city';

const Profile = () => {
  const { user, authFetch, login, clearCache } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [toast, setToast] = useState(null);

  const { register, handleSubmit: handleFormSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '', email: '', number: '', dob: '', gender: '',
      city: '', state: '', college: '', branch: '', degree: '',
      year: '', expertise: '', pic: null
    }
  });

  const watchState = watch('state');
  const watchPic = watch('pic');
  const watchName = watch('name');
  const watchEmail = watch('email');

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
          reset({
            name: data.user_name || data.trainer_name || user.name || '',
            email: data.email || data.trainer_email || user.email || '',
            number: data.user_number || data.trainer_number || '',
            dob: data.user_dob || data.trainer_dob || '',
            gender: data.user_gender || data.trainer_gender || '',
            city: data.user_city || data.trainer_city || '',
            state: data.user_state || data.trainer_state || '',
            college: data.user_college || '',
            branch: data.user_branch || '',
            degree: data.user_degree || '',
            year: data.user_year || '',
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

    const fetchColleges = async () => {
      try {
        const res = await fetch(`${USER_API}/colleges`);
        if (res.ok) {
          const data = await res.json();
          setColleges(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch colleges:", err);
      }
    };

    const fetchBranches = async () => {
      try {
        const res = await fetch(`${USER_API}/branches`);
        if (res.ok) {
          const data = await res.json();
          setBranches(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };

    const fetchDegrees = async () => {
      try {
        const res = await fetch(`${USER_API}/degrees`);
        if (res.ok) {
          const data = await res.json();
          setDegrees(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch degrees:", err);
      }
    };

    if (user) {
      fetchProfile();
      if (user.role === 'student') {
        fetchColleges();
        fetchBranches();
        fetchDegrees();
      }
    }
  }, [user, authFetch]);

  const indianStates = State.getStatesOfCountry('IN');
  const selectedStateObj = indianStates.find(s => s.name === watchState);
  const cities = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];

  const handleUpdate = async (formData) => {
    try {
      const isTrainer = user.role === 'trainer';
      let res;
      if (isTrainer) {
        const endpoint = `${TRAINER_API}/update-trainer`;
        const payload = {
          trainer_email: formData.email,
          trainer_name: formData.name,
          trainer_number: formData.number,
          trainer_dob: formData.dob,
          trainer_gender: formData.gender,
          trainer_city: formData.city,
          trainer_state: formData.state,
          trainer_expertise: formData.expertise
        };
        res = await authFetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const endpoint = `${USER_API}/update_profile`;
        const fd = new FormData();
        fd.append('user_name', formData.name);
        fd.append('user_number', formData.number);
        fd.append('user_dob', formData.dob);
        fd.append('user_gender', formData.gender);
        fd.append('user_city', formData.city);
        fd.append('user_state', formData.state);
        fd.append('user_college', formData.college);
        fd.append('user_branch', formData.branch);
        fd.append('user_degree', formData.degree);
        fd.append('user_year', formData.year);
        
        // Include picture if it's a URL or string
        if (formData.pic && typeof formData.pic === 'string') {
          fd.append('user_pic', formData.pic);
        }

        res = await authFetch(endpoint, {
          method: 'PUT',
          body: fd
        });
      }

      if (res.ok) {
        showToast('Profile updated successfully');
        // Update local context
        login({ ...user, name: formData.name, pic: formData.pic });
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
        setValue('pic', newPic);
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
              {watchPic ? (
                <img src={optimizeImageUrl(watchPic)} alt="Avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 900 }}>
                  {watchName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <input type="file" onChange={handlePicUpload} style={{ display: 'none' }} accept="image/*" />
                <Camera size={24} />
              </label>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--color-text)' }}>{watchName}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>{user.role === 'trainer' ? 'Expert Faculty' : 'Student'}</p>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                <Mail size={14} /> <span>{watchEmail}</span>
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
        <form onSubmit={handleFormSubmit(handleUpdate)} style={{ background: 'var(--color-surface)', borderRadius: '2.5rem', padding: '3rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            <ProfileInput label="Full Display Name" {...register('name')} icon={<User size={18} />} error={errors.name?.message} />
            <ProfileInput label="Contact Number" {...register('number')} icon={<Phone size={18} />} error={errors.number?.message} />
            <ProfileInput label="Birth Date" type="date" {...register('dob')} icon={<Calendar size={18} />} error={errors.dob?.message} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gender Protocol
              </label>
              <div style={{ position: 'relative' }}>
                <select {...register('gender')} style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', border: `1px solid ${errors.gender ? '#ef4444' : 'var(--color-border)'}`, background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select Identity</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <Activity size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              </div>
              {errors.gender && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.gender.message}</span>}
            </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  State/Region
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    {...register('state', { onChange: () => setValue('city', '') })}
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.state ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '1.25rem', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="" disabled>Select State</option>
                    {indianStates.map(s => (
                      <option key={s.isoCode} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                </div>
                {errors.state && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.state.message}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  City Hub
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    {...register('city')}
                    disabled={!watchState}
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', backgroundColor: watchState ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', border: `1px solid ${errors.city ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '1.25rem', color: watchState ? 'var(--color-text)' : 'var(--color-text-muted)', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: watchState ? 'pointer' : 'not-allowed' }}
                  >
                    <option value="" disabled>{watchState ? 'Select City' : 'Select State First'}</option>
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <Globe size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                </div>
                {errors.city && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.city.message}</span>}
              </div>

            {user.role === 'trainer' && (
              <div style={{ gridColumn: 'span 2' }}>
                <ProfileInput label="Area of Expertise" {...register('expertise')} icon={<Briefcase size={18} />} placeholder="e.g. Full Stack Development, Cloud Architecture" error={errors.expertise?.message} />
              </div>
            )}

            {user.role === 'student' && (
              <>
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    College Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select {...register('college')} style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', border: `1px solid ${errors.college ? '#ef4444' : 'var(--color-border)'}`, background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Select College</option>
                      {colleges.map(c => <option key={c.College_ID} value={c.College_ID}>{c.College_Name}</option>)}
                    </select>
                    <BookOpen size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  </div>
                  {errors.college && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.college.message}</span>}
                </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Degree
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select {...register('degree')} style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.degree ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '1.25rem', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option value="" disabled>Select your degree</option>
                        {degrees.map(d => <option key={d.degree_id} value={d.degree_id}>{d.degree_name}</option>)}
                      </select>
                      <GraduationCap size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    </div>
                    {errors.degree && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.degree.message}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Specialization / Branch
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select {...register('branch')} style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.branch ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '1.25rem', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option value="" disabled>Select your branch</option>
                        {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
                      </select>
                      <Briefcase size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    </div>
                    {errors.branch && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.branch.message}</span>}
                  </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Academic Year
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select {...register('year')} style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', border: `1px solid ${errors.year ? '#ef4444' : 'var(--color-border)'}`, background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Select Academic Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Other">Other</option>
                    </select>
                    <GraduationCap size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  </div>
                  {errors.year && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{errors.year.message}</span>}
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '1.25rem 3rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSubmitting ? 'Synchronizing...' : 'Save Profile Changes'}
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

const ProfileInput = React.forwardRef(({ label, icon, error, ...props }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input ref={ref} {...props} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '1.25rem', border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`, background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = (error ? '#ef4444' : 'var(--color-border)')} />
      <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
        {icon}
      </div>
    </div>
    {error && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{error}</span>}
  </div>
));

ProfileInput.displayName = 'ProfileInput';

export default Profile;
