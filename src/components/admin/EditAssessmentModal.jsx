import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Loader2, Save, FileUp, X } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API } from '../../config';

const AMInput = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
     <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
     <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ padding: '0.85rem 1.5rem', borderRadius: '1.15rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none' }} />
  </div>
);

const AMTextArea = ({ label, value, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
     <label style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
     <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={5} style={{ padding: '1.5rem 1.75rem', borderRadius: '1.5rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', resize: 'none' }} />
  </div>
);

const AMMiniInput = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
     <label style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
     <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.75rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', textAlign: 'center', fontWeight: 950, fontSize: '1.05rem', color: 'var(--color-text)', outline: 'none' }} />
  </div>
);

const EditAssessmentModal = ({ asm, onClose, showToast, refresh, BASE_URL }) => {
  const { authFetch, clearCache } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    Module_ID: asm.module_id,
    Title: asm.title || asm.Title,
    Description: asm.description || asm.Description || '',
    Total_Mark: asm.total_mark || asm.Total_Mark || 0,
    Passing_Mark: asm.passing_mark || asm.Passing_Mark || 0,
    Duration: asm.duration || asm.Duration || 0,
    Attempt_Limit: asm.attempt_limit || asm.Attempt_Limit || 1,
    Status: asm.status || asm.Status || 'active'
  });

  const handleBulkImportQuestions = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const importData = new FormData();
    importData.append('file', file);

    try {
      const res = await authFetch(`${ADMIN_API}/bulk_upload_questions/${asm.assessment_id}`, {
        method: 'POST',
        body: importData
      });

      if (res.ok) {
        showToast('Questions Imported Successfully');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const error = await res.json().catch(() => ({}));
        showToast(error.detail || 'Import failed', 'error');
      }
    } catch (err) {
      showToast('Network error during import', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(`${BASE_URL}/update_assessment/${asm.assessment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          course_id: asm.course_id,
          Total_Mark: parseInt(formData.Total_Mark) || 0,
          Passing_Mark: parseInt(formData.Passing_Mark) || 0,
          Duration: parseInt(formData.Duration) || 0,
          Attempt_Limit: parseInt(formData.Attempt_Limit) || 1
        })
      });
      if (res.ok) { 
          showToast('Assessment Updated'); 
          clearCache(`details_${asm.course_id}`);
          refresh(); 
          onClose(); 
      } else {
          const errorData = await res.json().catch(() => ({}));
          showToast(errorData.detail || 'Save failed: Unable to update assessment', 'error'); 
          setErrorShake(true);
          setTimeout(() => setErrorShake(false), 500);
      }
    } catch (e) { 
      showToast('Network failure: Check your connection', 'error'); 
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-padding)' }}>
       <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ width: 'clamp(320px, 95vw, 800px)', backgroundColor: 'var(--color-surface)', borderRadius: '3.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)' }}
       >
          <header style={{ padding: '2.5rem 4rem', background: 'linear-gradient(to right, var(--color-surface-muted), var(--color-surface))', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}><Target size={24}/></div>
                <h2 style={{ margin: 0 }}>Assessment Design</h2>
             </div>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".xlsx, .xls"
                  onChange={handleBulkImportQuestions}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.65rem', 
                    padding: '0.75rem 1.5rem', borderRadius: '1.25rem', 
                    background: '#0f172a', color: 'white', 
                    border: 'none', fontWeight: 900, fontSize: '0.8rem',
                    cursor: importing ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {importing ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                  {importing ? 'Importing...' : 'Bulk Import Questions'}
                </button>
                <button onClick={onClose} style={{ background: 'var(--color-surface-muted)', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '1rem', borderRadius: '1.5rem' }}><X size={24}/></button>
             </div>
          </header>

          <form onSubmit={handleSubmit} style={{ padding: '3.5rem', maxHeight: '75vh', overflowY: 'auto' }} className="no-scrollbar">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                   <AMInput label="Assessment Title" value={formData.Title} onChange={v => setFormData({...formData, Title: v})} />
                   <AMTextArea label="Evaluation Guidelines" placeholder="What should the user know before starting?" value={formData.Description} onChange={v => setFormData({...formData, Description: v})} />
                </div>
                <div style={{ background: 'var(--color-surface-muted)', borderRadius: '2.5rem', padding: '2.5rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <AMMiniInput label="Total Score" value={formData.Total_Mark} onChange={v => setFormData({...formData, Total_Mark: v})} />
                      <AMMiniInput label="Pass Score" value={formData.Passing_Mark} onChange={v => setFormData({...formData, Passing_Mark: v})} />
                      <AMMiniInput label="Minutes" value={formData.Duration} onChange={v => setFormData({...formData, Duration: v})} />
                      <AMMiniInput label="Allowed Retakes" value={formData.Attempt_Limit} onChange={v => setFormData({...formData, Attempt_Limit: v})} />
                   </div>
                </div>
             </div>

             <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '1rem 3rem' }}>Discard</button>
                 <motion.button 
                   type="submit" 
                   disabled={loading} 
                   className="btn btn-primary" 
                   style={{ 
                     padding: '1rem 6rem', 
                     background: errorShake ? '#ef4444' : '#f97316',
                     transition: 'all 0.2s',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     cursor: 'pointer'
                   }}
                   animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                 >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Confirm Design
                 </motion.button>
             </div>
          </form>
       </motion.div>
    </div>
  );
};

export default EditAssessmentModal;
