import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, Settings2, XCircle, Loader2, Save } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { ADMIN_API } from '../../config';

const Input = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
     <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
     <input {...props} style={{ width: '100%', padding: '0.85rem 1.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }} />
  </div>
);

const CategoryModal = ({ mode, category, categories, onClose, refresh, showToast }) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    Category_Name: '',
    slug: '',
    Parent_ID: 'root',
    Course_Description: '',
    Icon: 'dY"?',
    Thumbnail: ''
  });

  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        Category_Name: category.Category_Name,
        slug: category.slug || '',
        Parent_ID: category.Parent_ID || 'root',
        Course_Description: category.Course_Description,
        Icon: category.Icon || 'dY"?',
        Thumbnail: category.Thumbnail || ''
      });
    }
  }, [mode, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const slug = formData.Category_Name.toLowerCase().trim().replace(/\s+/g, '-');
    const isDuplicate = categories.some(cat => 
        cat.Category_Name.toLowerCase() === formData.Category_Name.trim().toLowerCase() && 
        (mode === 'create' || cat.Category_ID !== category.Category_ID)
    );

    if (isDuplicate) {
        showToast('Domain title already exists', 'error');
        setLoading(false);
        return;
    }

    try {
      const url = mode === 'create' ? `${ADMIN_API}/create-category` : `${ADMIN_API}/update-category/${category.Category_ID}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const payload = { 
        Category_Name: formData.Category_Name.trim(),
        slug: slug,
        Parent_ID: null, 
        Course_Description: formData.Course_Description.trim(),
        Icon: formData.Icon || 'dY"?',
        Thumbnail: formData.Thumbnail.length > 200 ? '' : formData.Thumbnail // Guard against DB limits
      };

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) { 
          showToast(`Category Saved`); 
          queryClient.invalidateQueries({ queryKey: ['admin_categories_full_data'] });
          refresh(); 
          onClose(); 
      }
      else { const d = await res.json(); showToast(d.detail || 'Error', 'error'); }
    } catch (e) { showToast('Sync failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-padding)' }}>
       <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ width: 'clamp(320px, 95vw, 750px)', backgroundColor: 'var(--color-surface)', borderRadius: '3.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)' }}
       >
          <header style={{ padding: '2.5rem 3.5rem', background: 'linear-gradient(to right, var(--color-surface-muted), var(--color-surface))', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{mode === 'create' ? <FolderPlus size={24}/> : <Settings2 size={24}/>}</div>
                <div>
                   <h2 style={{ margin: 0 }}>{mode === 'create' ? 'New Domain' : 'Adjust Domain'}</h2>
                   <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domain Architect</p>
                </div>
             </div>
             <button onClick={onClose} style={{ background: 'var(--color-surface-muted)', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.75rem', borderRadius: '1.25rem' }}><XCircle size={24}/></button>
          </header>

          <form onSubmit={handleSubmit} style={{ padding: '3.5rem', maxHeight: '75vh', overflowY: 'auto' }} className="no-scrollbar">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                   <Input label="Domain Title" value={formData.Category_Name} onChange={e => setFormData({...formData, Category_Name: e.target.value})} required placeholder="e.g. Artificial Intelligence" />
                   <Input label="Cover Image URL" value={formData.Thumbnail} onChange={e => setFormData({...formData, Thumbnail: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Core Narrative</label>
                   <textarea value={formData.Course_Description} onChange={e => setFormData({...formData, Course_Description: e.target.value})} rows={7} required style={{ width: '100%', padding: '1.25rem', borderRadius: '1.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', outline: 'none', resize: 'none', transition: 'border-color 0.2s' }} placeholder="What does this domain cover?" />
                </div>
             </div>

             <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '1rem 3rem' }}>Discard</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem 6rem' }}>
                   {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                   {mode === 'create' ? 'Establish' : 'Confirm'}
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
};

export default CategoryModal;
