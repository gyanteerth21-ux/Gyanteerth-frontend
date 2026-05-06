import { 
  Search, Plus, Edit, Mail, Phone, MapPin, Calendar, X, UserX, UserCheck, 
  Loader2, AlertCircle, CheckCircle2, User, Users, Layout, ArrowLeft, ArrowRight,
  ShieldCheck, Zap, Archive, Settings2, Trash2, Globe, Palette, Save, 
  Fingerprint, Briefcase, Activity, Grid, List, ChevronRight, Upload, Database, FileText
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API, getHeaders } from '../../config';



const BulkImportModal = ({ onClose, onImport, loading, type = 'faculty' }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleProcessFile = () => {
    if (!file) return;
    onImport(file);
  };



  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const [vibrate, setVibrate] = useState(false);

  useEffect(() => {
    if (error) {
      setVibrate(true);
      const timer = setTimeout(() => setVibrate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(20px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ width: 'min(95vw, 550px)', backgroundColor: 'var(--color-surface)', borderRadius: '2.5rem', boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.4)', border: '1px solid var(--color-border)', padding: '2.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950 }}>Bulk Import Faculty</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Upload an Excel (.xlsx) file to create multiple accounts</p>
          </div>
          <button onClick={onClose} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '100%', border: `2px ${error ? 'solid' : 'dashed'} ${error ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '2rem', padding: '3rem 2rem', textAlign: 'center', backgroundColor: error ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface-muted)', cursor: 'pointer', transition: 'all 0.3s', position: 'relative'
            }}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--color-border)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--color-border)';
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) { setFile(droppedFile); setError(null); }
              else setError('Only .xlsx files are supported');
            }}
          >
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', backgroundColor: error ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-primary-bg)', color: error ? '#ef4444' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={32} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: error ? '#ef4444' : 'var(--color-text)' }}>{file ? file.name : 'Select Excel File'}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Drag and drop or click to browse</p>
              </div>
            </div>
          </div>
          
          {error && <div style={{ marginTop: '1.25rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><AlertCircle size={14}/> {error}</div>}
        </div>

        <motion.button 
          animate={vibrate ? { x: [-5, 5, -5, 5, 0] } : {}}
          onClick={handleProcessFile}
          disabled={loading || !file}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1.15rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)', backgroundColor: error ? '#ef4444' : undefined, borderColor: error ? '#ef4444' : undefined }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
          {loading ? 'Initializing Nodes...' : error ? 'Retry Import' : 'Begin Bulk Upload'}
        </motion.button>
      </motion.div>
    </div>,
    document.body
  );
};

const AdminUsers = () => {
  const { authFetch, smartFetch, clearCache } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validateMobile = (num) => /^[0-9]{10}$/.test(num);
  const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(pass);


  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await smartFetch(`${ADMIN_API}/all_trainer`, { cacheKey: 'admin_all_trainers' });
      if (data) {
        const activeList = data.active_trainer_email || [];
        const inactiveList = data.inactive_trainer_email || [];

        const fetchDetails = async (list, status) => {
          const promises = list.map(async (item) => {
            const email = typeof item === 'string' ? item : Object.values(item)[0];
            if (!email) return null;
            try {
               const detail = await smartFetch(`${ADMIN_API}/get_trainer?trainer_email=${email}`, {
                  cacheKey: `trainer_detail_${email}`
               });
               if (detail) return { ...detail, trainer_status: status };
            } catch (e) {}
            return null;
          });
          const results = await Promise.all(promises);
          return results.filter(Boolean);
        };

        const [activeDetails, inactiveDetails] = await Promise.all([
          fetchDetails(activeList, 'active'),
          fetchDetails(inactiveList, 'inactive')
        ]);
        
        setTrainers([...activeDetails, ...inactiveDetails]);
      }
    } catch (err) {
      showToast('Registry sync interrupted', 'error');
    } finally {
      setLoading(false);
    }
  }, [smartFetch]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => fd.append(key, val));
      const res = await authFetch(`${ADMIN_API}/create_trainer`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd
      });
      if (res.ok) { 
        showToast('Faculty operational'); 
        clearCache('admin_all_trainers');
        setTrainers(prev => [{ ...formData, trainer_status: 'active' }, ...prev]);
        setShowCreateModal(false); 
      }
      else { const d = await res.json(); showToast(d.detail || 'Creation denied', 'error'); }
    } catch (err) { showToast('Sync protocol failure', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      // Transform payload to match backend schema requirements
      const payload = {
        ...formData,
        password: formData.trainer_pass,
        trainer_number: String(formData.trainer_number)
      };

      const res = await authFetch(`${ADMIN_API}/update-trainer`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) { 
        setTrainers(prev => prev.map(t => (t.email === formData.trainer_email || t.trainer_email === formData.trainer_email) ? { ...t, ...formData } : t));
        showToast('Profile sync success'); 
        clearCache('admin_all_trainers');
        if (formData.trainer_email) {
          clearCache(`trainer_detail_${formData.trainer_email}`);
          refreshSingleTrainer(formData.trainer_email, selectedTrainer.trainer_status);
        }
        setShowEditModal(false); 
      }
      else showToast('Update rejected', 'error');
    } catch (err) { showToast('Sync protocol failure', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleBulkImport = async (file) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authFetch(`${ADMIN_API}/bulk_create_trainers`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        showToast('Faculty initialized successfully');
        setShowImportModal(false);
        clearCache('admin_all_trainers');
        fetchTrainers();
      } else {
        const errorData = await response.json();
        console.error("Bulk Import Error Details:", errorData);
        const detail = Array.isArray(errorData.detail) ? errorData.detail[0]?.msg : errorData.detail;
        showToast(detail ? `Import failed: ${detail}` : 'Unable to import data', 'error');
      }
    } catch (err) {
      showToast('Neural link failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const refreshSingleTrainer = async (email, status) => {
    try {
      const detail = await smartFetch(`${ADMIN_API}/get_trainer?trainer_email=${email}`, { forceRefresh: true });
      if (detail) {
        setTrainers(prev => prev.map(t => (t.email === email || t.trainer_email === email) ? { ...detail, trainer_status: status } : t));
      }
    } catch (e) {}
  };

  const handleToggleStatus = async (email, currentStatus, name) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Would you like to ${action} ${name || email}?`)) return;
    setActionLoading(true);
    try {
      const targetStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const res = await authFetch(`${ADMIN_API}/inactive-trainer`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_email: email, status: targetStatus })
      });
      if (res.ok) { 
        setTrainers(prev => prev.map(t => (t.email === email || t.trainer_email === email) ? { ...t, trainer_status: targetStatus } : t));
        showToast(`Trainer ${targetStatus === 'active' ? 'Activated' : 'Deactivated'}`); 
        clearCache('admin_all_trainers');
        clearCache(`trainer_detail_${email}`);
        refreshSingleTrainer(email, targetStatus);
      }
      else showToast('Status change denied', 'error');
    } catch (err) { showToast('Sync protocol failure', 'error'); }
    finally { setActionLoading(false); }
  };

  const filteredTrainers = trainers.filter(t => {
    const q = searchQuery.toLowerCase();
    const name = (t.user_name || t.trainer_name || '').toLowerCase();
    const email = (t.email || t.trainer_email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-muted)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', paddingBottom: '10rem' }}>
      
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem 0' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.15rem' }}>
                  <Users size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Faculty Intelligence</span>
               </div>
               <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>Trainer Registry</h1>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ position: 'relative' }}>
                 <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                 <input 
                  type="text" 
                  placeholder="Scan nodes..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  style={{ width: '260px', padding: '0.65rem 1rem 0.65rem 2.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: 'var(--color-text)' }} 
                 />
               </div>

               
               <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-muted)', padding: '0.35rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)' }}>
                  <button onClick={() => setViewMode('grid')} style={{ padding: '0.6rem 0.85rem', borderRadius: '0.9rem', border: 'none', background: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', boxShadow: viewMode === 'grid' ? 'var(--shadow-md)' : 'none', transition: 'all 0.3s' }}><Grid size={20}/></button>
                  <button onClick={() => setViewMode('list')} style={{ padding: '0.6rem 0.85rem', borderRadius: '0.9rem', border: 'none', background: viewMode === 'list' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', boxShadow: viewMode === 'list' ? 'var(--shadow-md)' : 'none', transition: 'all 0.3s' }}><List size={20}/></button>
               </div>

                <button 
                  onClick={() => setShowImportModal(true)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', border: 'none', backgroundColor: '#0f172a', color: 'white', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <Upload size={16} /> Bulk Import
                </button>

                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem', borderRadius: '1.15rem' }}
                >
                  <Plus size={18} /> <span className="hide-on-mobile">Add Trainer</span>
                </button>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2.5rem var(--page-padding)' }}>
         <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3.5rem', overflowX: 'auto', paddingBottom: '0.75rem' }} className="no-scrollbar">
            <CompactStat label="Total Trainers" value={trainers.length} icon={<Fingerprint size={16} />} />
            <CompactStat label="Active Faculty" value={trainers.filter(t => t.trainer_status === 'active').length} icon={<Zap size={16} color="var(--color-primary)" />} />
            <CompactStat label="Core Systems" value="Gyanteerth LMS" icon={<ShieldCheck size={16} color="#64748b" />} />
         </div>

         <div className="arcade-container">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)', backgroundSize: '32px 32px' }} />


         <AnimatePresence mode="wait">
           {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '10rem 0' }}
              >
                 <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
                 <p style={{ marginTop: '2rem', fontSize: '1rem', fontWeight: 950, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>SYNCING RECORDS...</p>
              </motion.div>
           ) : filteredTrainers.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '8rem 2rem', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '1px dashed var(--color-border-strong)' }}
              >
                 <Briefcase size={60} color="var(--color-border-strong)" style={{ marginBottom: '2.5rem' }} />
                 <h2>No Records Detected</h2>
                 <p style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>The intelligence registry is currently empty. Initialize your first faculty node to begin.</p>
              </motion.div>
           ) : (
              <motion.div 
                key={viewMode}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '2rem' } : { display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                 {filteredTrainers.map((trainer, index) => (
                    viewMode === 'grid' ? (
                       <PremiumUserCard 
                          key={trainer.email} 
                          trainer={trainer} index={index}
                          onView={(e) => { setClickPos({ x: e.clientX, y: e.clientY }); setSelectedTrainer(trainer); setShowViewModal(true); }}
                          onEdit={() => { setSelectedTrainer(trainer); setShowEditModal(true); }}
                          onToggle={() => handleToggleStatus(trainer.email, trainer.trainer_status, trainer.user_name)}
                          isActionLoading={actionLoading}
                       />
                    ) : (
                       <PremiumUserListRow 
                          key={trainer.email} 
                          trainer={trainer} index={index}
                          onView={(e) => { setClickPos({ x: e.clientX, y: e.clientY }); setSelectedTrainer(trainer); setShowViewModal(true); }}
                          onEdit={() => { setSelectedTrainer(trainer); setShowEditModal(true); }}
                          onToggle={() => handleToggleStatus(trainer.email, trainer.trainer_status, trainer.user_name)}
                       />
                    )
                 ))}
              </motion.div>
           )}
         </AnimatePresence>
      </div>

      <AnimatePresence>
        {showImportModal && (
          <BulkImportModal 
            onClose={() => setShowImportModal(false)}
            onImport={handleBulkImport}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {showCreateModal && (
        <TrainerFormModal
          title="Add New Trainer"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          loading={actionLoading}
          isCreate
          validateMobile={validateMobile}
          validatePassword={validatePassword}
          showToast={showToast}
        />
      )}

      {showEditModal && selectedTrainer && (
        <TrainerFormModal
          title="Edit Trainer Profile"
          trainer={selectedTrainer}
          onClose={() => { setShowEditModal(false); setSelectedTrainer(null); }}
          onSubmit={handleUpdate}
          loading={actionLoading}
          validateMobile={validateMobile}
          validatePassword={validatePassword}
          showToast={showToast}
        />
      )}

      <AnimatePresence>
         {showViewModal && selectedTrainer && (
            <ViewTrainerModal
               trainer={selectedTrainer}
               origin={clickPos}
               onClose={() => { setShowViewModal(false); setSelectedTrainer(null); }}
            />
         )}
      </AnimatePresence>

      {toast && createPortal(
        <div style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000001, padding: '1.15rem 3rem', borderRadius: '4rem', backgroundColor: '#111827', color: 'white', fontWeight: '900', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.5s' }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} color="var(--color-primary)" /> : <AlertCircle size={20} color="#ef4444" />}
          {toast.message}
        </div>,
        document.body
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) { .hide-on-mobile { display: none; } }
      `}</style>
      </div>
    </div>
  );
};

const CompactStat = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', minWidth: 'max-content' }}>
     <div style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: 'var(--color-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>{icon}</div>
     <div>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1 }}>{value}</h4>
        <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
     </div>
  </div>
);

const PremiumUserCard = ({ trainer, onView, onEdit, onToggle, isActionLoading, index }) => {
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

const PremiumUserListRow = ({ trainer, onView, onEdit, onToggle, index }) => {
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

const VItem = ({ icon, label, value }) => (
  <div>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.55rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
        {React.cloneElement(icon, { size: 11, color: '#64748b' })} {label}
     </div>
     <div style={{ fontWeight: 950, color: 'var(--color-text)', fontSize: '0.85rem' }}>{value}</div>
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

const Input = ({ label, error, icon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
     <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{icon && React.cloneElement(icon, { size: 14 })} {label}</label>
     <div style={{ position: 'relative' }}>
        <input {...props} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1px solid ${error ? '#ef4444' : 'var(--color-border-strong)'}`, background: 'var(--color-surface-muted)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }} />
        {error && <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 950 }}>{error}</div>}
     </div>
  </div>
);

export default AdminUsers;
