import React, { useState, useEffect } from 'react';
import { Award, Network, Plus, Edit, Trash2, Search, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API } from '../../config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { degreeSchema, branchSchema } from '../../shared/schemas';

const Academics = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('degrees'); // 'degrees' or 'branches'
  
  const [degrees, setDegrees] = useState([]);
  const [branches, setBranches] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isDegreeModalOpen, setIsDegreeModalOpen] = useState(false);
  const [selectedDegreeId, setSelectedDegreeId] = useState(null);
  const { register: registerDegree, handleSubmit: handleDegreeSubmit, reset: resetDegree, setValue: setDegreeValue, formState: { errors: degreeErrors, isSubmitting: isDegreeSubmitting } } = useForm({
    resolver: zodResolver(degreeSchema),
    defaultValues: { name: '' }
  });
  
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const { register: registerBranch, handleSubmit: handleBranchSubmit, reset: resetBranch, setValue: setBranchValue, formState: { errors: branchErrors, isSubmitting: isBranchSubmitting } } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: '' }
  });
  
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [degreesRes, branchesRes] = await Promise.all([
        authFetch(`${ADMIN_API}/degrees`),
        authFetch(`${ADMIN_API}/branches`)
      ]);
      
      if (!degreesRes.ok) throw new Error('Failed to fetch degrees');
      if (!branchesRes.ok) throw new Error('Failed to fetch branches');
      
      const degreesData = await degreesRes.json();
      const branchesData = await branchesRes.json();
      
      setDegrees(degreesData.data || []);
      setBranches(branchesData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Degree Handlers ---
  const onSubmitDegree = async (data) => {
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const isUpdate = !!selectedDegreeId;
      const url = isUpdate ? `${ADMIN_API}/degrees/${selectedDegreeId}` : `${ADMIN_API}/degrees`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Degree_Name: data.name })
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || 'Failed to save degree');
      
      setActionSuccess(`Degree ${isUpdate ? 'updated' : 'created'} successfully!`);
      fetchData();
      setTimeout(() => {
        setIsDegreeModalOpen(false);
        resetDegree();
        setSelectedDegreeId(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteDegree = async (id) => {
    if (!window.confirm('Are you sure you want to delete this degree?')) return;
    try {
      const res = await authFetch(`${ADMIN_API}/degrees/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete degree');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Branch Handlers ---
  const onSubmitBranch = async (data) => {
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const isUpdate = !!selectedBranchId;
      const url = isUpdate ? `${ADMIN_API}/branches/${selectedBranchId}` : `${ADMIN_API}/branches`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Branch_Name: data.name })
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || 'Failed to save branch');
      
      setActionSuccess(`Branch ${isUpdate ? 'updated' : 'created'} successfully!`);
      fetchData();
      setTimeout(() => {
        setIsBranchModalOpen(false);
        resetBranch();
        setSelectedBranchId(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      const res = await authFetch(`${ADMIN_API}/branches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete branch');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDegrees = degrees.filter(b => b.degree_name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBranches = branches.filter(b => b.branch_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="users-page" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award className="text-primary" size={28} />
            Degrees & Branches
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Manage academic degrees and their related branches globally.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {activeTab === 'degrees' ? (
            <button 
              onClick={() => { resetDegree(); setSelectedDegreeId(null); setIsDegreeModalOpen(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Add Degree
            </button>
          ) : (
            <button 
              onClick={() => { resetBranch(); setSelectedBranchId(null); setIsBranchModalOpen(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Add Branch
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => { setActiveTab('degrees'); setSearchQuery(''); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'degrees' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'degrees' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'degrees' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Award size={18} /> Degrees ({degrees.length})
        </button>
        <button
          onClick={() => { setActiveTab('branches'); setSearchQuery(''); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'branches' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'branches' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'branches' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Network size={18} /> Branches ({branches.length})
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
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
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '1rem' }}>
          {error}
        </div>
      ) : (
        <div className="table-responsive card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>{activeTab === 'degrees' ? 'Degree Name' : 'Branch Name'}</th>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'degrees' && filteredDegrees.length === 0 && (
                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No degrees found.</td></tr>
              )}
              {activeTab === 'degrees' && filteredDegrees.map(degree => (
                <tr key={degree.degree_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{degree.degree_name}</td>
                  <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{degree.degree_id}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => { resetDegree(); setDegreeValue('name', degree.degree_name); setSelectedDegreeId(degree.degree_id); setIsDegreeModalOpen(true); }}
                        className="btn"
                        style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDegree(degree.degree_id)}
                        className="btn"
                        style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'branches' && filteredBranches.length === 0 && (
                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No branches found.</td></tr>
              )}
              {activeTab === 'branches' && filteredBranches.map(branch => (
                <tr key={branch.branch_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{branch.branch_name}</td>
                  <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{branch.branch_id}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => { resetBranch(); setBranchValue('name', branch.branch_name); setSelectedBranchId(branch.branch_id); setIsBranchModalOpen(true); }}
                        className="btn"
                        style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteBranch(branch.branch_id)}
                        className="btn"
                        style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Degree Modal */}
      <AnimatePresence>
        {isDegreeModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDegreeModalOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award className="text-primary" size={20} />
                  {selectedDegreeId ? 'Edit Degree' : 'Add New Degree'}
                </h2>
                <button type="button" onClick={() => setIsDegreeModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleDegreeSubmit(onSubmitDegree)} style={{ padding: '1.5rem' }}>
                {actionError && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} />{actionError}</div>}
                {actionSuccess && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} />{actionSuccess}</div>}
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Degree Name</label>
                  <input {...registerDegree('name')} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${degreeErrors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} placeholder="e.g. B.Tech" />
                  {degreeErrors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{degreeErrors.name.message}</p>}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsDegreeModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isDegreeSubmitting}>
                    {isDegreeSubmitting ? <Loader2 size={18} className="spin" /> : (selectedDegreeId ? 'Update Degree' : 'Add Degree')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Branch Modal */}
      <AnimatePresence>
        {isBranchModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBranchModalOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Network className="text-primary" size={20} />
                  {selectedBranchId ? 'Edit Branch' : 'Add New Branch'}
                </h2>
                <button type="button" onClick={() => setIsBranchModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleBranchSubmit(onSubmitBranch)} style={{ padding: '1.5rem' }}>
                {actionError && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} />{actionError}</div>}
                {actionSuccess && <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} />{actionSuccess}</div>}
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Branch Name</label>
                  <input {...registerBranch('name')} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${branchErrors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} placeholder="e.g. Computer Science" />
                  {branchErrors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{branchErrors.name.message}</p>}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsBranchModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isBranchSubmitting}>
                    {isBranchSubmitting ? <Loader2 size={18} className="spin" /> : (selectedBranchId ? 'Update Branch' : 'Add Branch')}
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

export default Academics;
