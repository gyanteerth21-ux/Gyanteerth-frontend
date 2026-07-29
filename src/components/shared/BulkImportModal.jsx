import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Upload, X, AlertCircle, Database, Loader2 } from 'lucide-react';

const BulkImportModal = ({ onClose, onImport, loading, type = 'student' }) => {
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
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950 }}>Bulk Import {type === 'student' ? 'Students' : 'Faculty'}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Upload an Excel (.xlsx) file to create multiple accounts</p>
          </div>
          <button onClick={onClose} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
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

          {error && <div style={{ marginTop: '1.25rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><AlertCircle size={14} /> {error}</div>}
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

export default BulkImportModal;
