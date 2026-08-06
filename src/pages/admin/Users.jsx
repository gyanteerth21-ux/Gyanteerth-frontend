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
import ExportExcelButton from '../../components/ExportExcelButton';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API, getHeaders } from '../../config';
import ViewTrainerModal from '../../components/admin/ViewTrainerModal';
import TrainerFormModal from '../../components/admin/TrainerFormModal';
import { PremiumUserCard, PremiumUserListRow } from '../../components/admin/UserCards';

import BulkImportModal from '../../components/shared/BulkImportModal';

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

                <ExportExcelButton data={trainers} filename="Admin_Trainers_List" sheetName="Trainers" />
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

export default AdminUsers;
