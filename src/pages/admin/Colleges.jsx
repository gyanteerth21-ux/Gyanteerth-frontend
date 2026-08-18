import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ShieldCheck, Building, UserPlus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API, getHeaders } from '../../config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collegeSchema, tpoSchema } from '../../shared/schemas';

const Colleges = () => {
  const { authFetch } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [tpos, setTpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);
  const { register: registerCollege, handleSubmit: handleCollegeSubmit, reset: resetCollege, setValue: setCollegeValue, formState: { errors: collegeErrors, isSubmitting: isCollegeSubmitting } } = useForm({
    resolver: zodResolver(collegeSchema),
    defaultValues: { name: '' }
  });
  
  const [isTpoModalOpen, setIsTpoModalOpen] = useState(false);
  const [tpoCollegeName, setTpoCollegeName] = useState('');
  const { register: registerTpo, handleSubmit: handleTpoSubmit, reset: resetTpo, setValue: setTpoValue, formState: { errors: tpoErrors, isSubmitting: isTpoSubmitting } } = useForm({
    resolver: zodResolver(tpoSchema),
    defaultValues: { name: '', email: '', password: '', number: '', collegeId: '' }
  });
  
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [collegesRes, tposRes] = await Promise.all([
        authFetch(`${ADMIN_API}/colleges`),
        authFetch(`${ADMIN_API}/tpos`)
      ]);
      
      if (!collegesRes.ok) throw new Error('Failed to fetch colleges');
      const collegesData = await collegesRes.json();
      setColleges(collegesData.data || []);
      
      if (tposRes.ok) {
        const tposData = await tposRes.json();
        setTpos(tposData.tpos || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmitCollege = async (data) => {
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const isUpdate = !!selectedCollegeId;
      const url = isUpdate ? `${ADMIN_API}/colleges/${selectedCollegeId}` : `${ADMIN_API}/colleges`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ College_Name: data.name })
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || 'Operation failed');
      
      setActionSuccess(`College ${isUpdate ? 'updated' : 'created'} successfully!`);
      fetchData();
      setTimeout(() => {
        setIsCollegeModalOpen(false);
        resetCollege();
        setSelectedCollegeId(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college?')) return;
    
    try {
      const res = await authFetch(`${ADMIN_API}/colleges/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete college');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const onSubmitTpo = async (data) => {
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const res = await authFetch(`${ADMIN_API}/tpo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tpo_name: data.name,
          tpo_email: data.email,
          tpo_pass: data.password,
          tpo_number: data.number,
          tpo_college: data.collegeId
        })
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || 'Failed to create TPO');
      
      setActionSuccess('TPO created successfully!');
      setTimeout(() => {
        setIsTpoModalOpen(false);
        resetTpo();
        setTpoCollegeName('');
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const filteredColleges = colleges.filter(c => c.College_Name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="users-page" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building className="text-primary" size={28} />
            Colleges & TPO Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Manage partner colleges and assign Training & Placement Officers
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => { resetCollege(); setSelectedCollegeId(null); setIsCollegeModalOpen(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            Add College
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input 
            type="text" 
            placeholder="Search colleges..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spin text-primary" size={32} />
        </div>
      ) : error ? (
        <div className="alert-error" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      ) : (
        <div className="table-responsive card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>College Name</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.length === 0 ? (
                <tr><td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No colleges found.</td></tr>
              ) : (
                filteredColleges.map(college => (
                  <tr key={college.College_ID} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {college.College_Name}
                      {tpos.filter(t => t.college === college.College_ID || t.college === college.College_Name).length > 0 && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>TPO Accounts ({tpos.filter(t => t.college === college.College_ID || t.college === college.College_Name).length})</span>
                          {tpos.filter(t => t.college === college.College_ID || t.college === college.College_Name).map(tpo => (
                            <div key={tpo.user_id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500, backgroundColor: 'var(--color-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                              <ShieldCheck size={14} className="text-primary" />
                              <span>{tpo.name}</span>
                              <span style={{ color: 'var(--color-border)', margin: '0 0.25rem' }}>|</span>
                              <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>{tpo.email}</span>
                              <span style={{ color: 'var(--color-border)', margin: '0 0.25rem' }}>|</span>
                              <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>{tpo.number}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            resetTpo();
                            setTpoValue('collegeId', college.College_ID);
                            setTpoCollegeName(college.College_Name);
                            setIsTpoModalOpen(true);
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <UserPlus size={14} /> Add TPO
                        </button>
                        <button 
                          onClick={() => { resetCollege(); setCollegeValue('name', college.College_Name); setSelectedCollegeId(college.College_ID); setIsCollegeModalOpen(true); }}
                          className="btn"
                          style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCollege(college.College_ID)}
                          className="btn"
                          style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* College Modal */}
      <AnimatePresence>
        {isCollegeModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCollegeModalOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building className="text-primary" size={20} />
                  {selectedCollegeId ? 'Edit College' : 'Add New College'}
                </h2>
                <button type="button" onClick={() => setIsCollegeModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCollegeSubmit(onSubmitCollege)} style={{ padding: '1.5rem' }}>
                {actionError && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} />{actionError}</div>}
                {actionSuccess && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} />{actionSuccess}</div>}
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>College Name</label>
                  <input {...registerCollege('name')} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${collegeErrors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} placeholder="e.g. MIT College of Engineering" />
                  {collegeErrors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{collegeErrors.name.message}</p>}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsCollegeModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isCollegeSubmitting}>
                    {isCollegeSubmitting ? <Loader2 size={18} className="spin" /> : (selectedCollegeId ? 'Update College' : 'Add College')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TPO Modal */}
      <AnimatePresence>
        {isTpoModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTpoModalOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '600px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck className="text-primary" size={20} />
                  Add TPO for {tpoCollegeName}
                </h2>
                <button type="button" onClick={() => setIsTpoModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleTpoSubmit(onSubmitTpo)} style={{ padding: '1.5rem' }}>
                {actionError && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} />{actionError}</div>}
                {actionSuccess && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} />{actionSuccess}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>TPO Name</label>
                    <input {...registerTpo('name')} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${tpoErrors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} />
                    {tpoErrors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{tpoErrors.name.message}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
                    <input {...registerTpo('email')} type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${tpoErrors.email ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} />
                    {tpoErrors.email && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{tpoErrors.email.message}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
                    <input {...registerTpo('password')} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${tpoErrors.password ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} />
                    {tpoErrors.password && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{tpoErrors.password.message}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
                    <input {...registerTpo('number')} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${tpoErrors.number ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} />
                    {tpoErrors.number && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{tpoErrors.number.message}</p>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsTpoModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isTpoSubmitting}>
                    {isTpoSubmitting ? <Loader2 size={18} className="spin" /> : 'Create TPO'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Colleges;
