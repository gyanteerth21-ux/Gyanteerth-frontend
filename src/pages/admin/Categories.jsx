import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Edit, Trash2, ChevronRight, Folder, 
  Layers, Package, Grid, List as ListIcon, Loader2, 
  PlusCircle, XCircle, Info, ArrowRight, FolderPlus,
  Image as ImageIcon, Type, Layout, ExternalLink,
  CheckCircle2, AlertCircle, Plus as PlusIcon, Settings2,
  BookOpen, Target, ArrowUpRight, Save, List
} from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API } from '../../config';
import { CreateCourseModal } from '../../components/admin/CourseModals';

const AdminCategories = () => {
  const { user, authFetch, smartFetch, clearCache } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [selectedCategoryIdForCourse, setSelectedCategoryIdForCourse] = useState('');
  const [trainers, setTrainers] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };


  const fetchCategories = useCallback(async (force = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const [data, sData] = await Promise.all([
        smartFetch(`${ADMIN_API}/get-categories`, { cacheKey: 'admin_categories', forceRefresh: force }),
        smartFetch(`${ADMIN_API}/courses/ids-by-status`, { cacheKey: 'admin_course_ids', forceRefresh: force })
      ]);

      if (data) setCategories(data.categories || []);
      if (sData) setLiveCount(sData.courses?.active?.length || 0);

    } catch (err) {
      showToast('Backend synchronization failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, smartFetch]);

  const fetchTrainers = useCallback(async () => {
    try {
      const res = await authFetch(`${ADMIN_API}/all_trainer`);
      if (res.ok) {
        const data = await res.json();
        const active = data.active_trainer_email || [];
        const inactive = data.inactive_trainer_email || [];
        const process = (list) => list.map(t => {
           const id = Object.keys(t)[0];
           return { id, email: t[id] };
        });
        setTrainers([...process(active), ...process(inactive)]);
      }
    } catch (err) { console.error('Faculty fetch failed'); }
  }, [authFetch]);

  useEffect(() => {
    fetchCategories();
    fetchTrainers();
  }, [fetchCategories, fetchTrainers]);

  const handleDelete = async (catId) => {
    if (!window.confirm('Caution: Delete this category and all its associations? This action is permanent.')) return;
    try {
      const res = await authFetch(`${ADMIN_API}/delete-category/${catId}`, { method: 'DELETE' });
      if (res.ok) { 
          showToast('Category Deleted'); 
          clearCache('admin_categories');
          fetchCategories(true); 
      } else {
          try {
              const errData = await res.json();
              showToast(errData.message || errData.detail || 'Operation failed', 'error');
          } catch (e) {
              showToast('Operation failed', 'error');
          }
      }
    } catch (err) { showToast('Network Error', 'error'); }
  };

  const filteredCategories = categories.filter(cat => 
    cat.Category_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-muted)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', paddingBottom: '10rem' }}>
      
      {/* COMPACT HEADER SECTION */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem 0' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.15rem' }}>
                  <Folder size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Domain Taxonomy</span>
               </div>
               <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-text)', letterSpacing: '-0.04em' }}>Course Categories</h1>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ position: 'relative' }}>
                 <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                 <input type="text" placeholder="Identify stack..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '260px', padding: '0.65rem 1rem 0.65rem 2.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: 'var(--color-text)' }} />
               </div>
               
               <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-muted)', padding: '0.35rem', borderRadius: '1.15rem', border: '1px solid var(--color-border)' }}>
                 <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.85rem', border: 'none', background: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', boxShadow: viewMode === 'grid' ? 'var(--shadow-md)' : 'none', transition: 'all 0.3s' }}><Grid size={18}/></button>
                 <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.85rem', border: 'none', background: viewMode === 'list' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', boxShadow: viewMode === 'list' ? 'var(--shadow-md)' : 'none', transition: 'all 0.3s' }}><List size={18}/></button>
               </div>
               
               <button onClick={() => { setModalMode('create'); setIsModalOpen(true); }} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: '1.15rem' }}>
                 <Plus size={18} /> <span className="hide-on-mobile">New Domain</span>
               </button>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2.5rem var(--page-padding)' }}>
         {/* OPTIMIZED DASHBOARD BAR */}
         <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '1rem' }} className="no-scrollbar">
            <StatBox label="Active Domains" value={categories.length} icon={<Folder size={16} color="var(--color-primary)" />} />
            <StatBox label="Live Courses" value={liveCount} icon={<BookOpen size={16} color="#f97316" />} />
         </div>

         {/* REFINED MAIN GRID */}
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
                 <p style={{ marginTop: '2rem', fontSize: '1rem', fontWeight: 950, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>FETCHING DOMAINS...</p>
              </motion.div>
           ) : filteredCategories.length === 0 ? (
              <motion.div 
                key="empty" 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '8rem 2rem', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '1px dashed var(--color-border-strong)' }}
              >
                 <Folder size={60} color="var(--color-border-strong)" style={{ marginBottom: '2rem' }} />
                 <h2>No Categories Found</h2>
                 <p style={{ maxWidth: '400px', margin: '1rem auto 0' }}>Initialize your educational landscape. Create your first category stack to begin.</p>
              </motion.div>
           ) : viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '2.5rem' }}
              >
                 {filteredCategories.map((cat, index) => (
                   <PremiumCategoryCard 
                      key={cat.Category_ID} 
                      cat={cat} 
                      index={index}
                      onEdit={() => { setSelectedCategory(cat); setModalMode('edit'); setIsModalOpen(true); }}
                      onDelete={() => handleDelete(cat.Category_ID)}
                      onView={() => navigate(`/admin/courses?categoryId=${cat.Category_ID}`)}
                      onCreateCourse={() => { setSelectedCategoryIdForCourse(cat.Category_ID); setIsCreateCourseModalOpen(true); }}
                   />
                 ))}
              </motion.div>
           ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                 {filteredCategories.map((cat, index) => (
                   <PremiumCategoryListRow 
                      key={cat.Category_ID} 
                      cat={cat} 
                      index={index}
                      onEdit={() => { setSelectedCategory(cat); setModalMode('edit'); setIsModalOpen(true); }}
                      onDelete={() => handleDelete(cat.Category_ID)}
                      onView={() => navigate(`/admin/courses?categoryId=${cat.Category_ID}`)}
                      onCreateCourse={() => { setSelectedCategoryIdForCourse(cat.Category_ID); setIsCreateCourseModalOpen(true); }}
                   />
                 ))}
              </motion.div>
           )}
         </AnimatePresence>
         </div>
      </div>

      {isModalOpen && <CategoryModal mode={modalMode} category={selectedCategory} categories={categories} onClose={() => { setIsModalOpen(false); setSelectedCategory(null); }} refresh={() => fetchCategories(true)} showToast={showToast} />}
      
      {isCreateCourseModalOpen && <CreateCourseModal onClose={() => setIsCreateCourseModalOpen(false)} trainers={trainers} categories={categories} showToast={showToast} refresh={() => fetchCategories(true)} initialCategoryId={selectedCategoryIdForCourse} />}

      {toast && (
        <div style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2500, padding: '1.15rem 3rem', borderRadius: '4rem', backgroundColor: '#111827', color: 'white', fontWeight: '900', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.5s' }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} color="var(--color-primary)" /> : <AlertCircle size={20} color="#ef4444" />}
          {toast.message}
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .hide-on-mobile { display: none; }
        }
        .arcade-container {
          position: relative;
        }
        .arcade-container::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 3.5rem;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.03);
          pointer-events: none;
        }
        .dark .arcade-container {
          background-color: rgba(255,255,255,0.01) !important;
          box-shadow: inset 0 10px 30px rgba(0,0,0,0.5) !important;
          border-color: rgba(255,255,255,0.05) !important;
        }
        .premium-glow-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--color-primary) !important;
          box-shadow: 0 15px 45px rgba(2, 6, 23, 0.15);
          background-image: linear-gradient(135deg, transparent 95%, rgba(0,0,0,0.02) 100%), radial-gradient(circle at 2px 2px, rgba(0,0,0,0.01) 1px, transparent 0);
          background-size: 100% 100%, 30px 30px;
        }
        .dark .premium-glow-card:hover {
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.15);
          background-image: linear-gradient(135deg, transparent 95%, rgba(255,255,255,0.05) 100%), radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
        }
      `}</style>
    </div>
  );
};

const StatBox = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1.15rem', minWidth: 'max-content' }}>
     <div style={{ width: '2rem', height: '2rem', borderRadius: '0.7rem', backgroundColor: 'var(--color-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
     <div>
        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1 }}>{value}</h4>
        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
     </div>
  </div>
);

const PremiumCategoryCard = ({ cat, onEdit, onDelete, onView, onCreateCourse, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{ backgroundColor: 'var(--color-surface)', borderRadius: '2.5rem', padding: 'var(--space-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
    className="premium-glow-card"
  >
     <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle at 100% 0%, var(--color-primary-light)10 0%, transparent 60%)', pointerEvents: 'none' }} />
     
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
           <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={cat.Thumbnail || "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>
           <div>
              <div style={{ fontSize: '0.55rem', fontWeight: 950, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Stack Domain</div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{cat.Category_Name}</h3>
           </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
           <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={14}/></button>
           <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: '#fff1f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14}/></button>
        </div>
     </div>

     <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, height: '2.7rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {cat.Course_Description}
     </p>

     <div style={{ display: 'flex', gap: '0.65rem', position: 'relative', zIndex: 10 }}>
        <button onClick={onView} className="btn btn-primary" style={{ flex: 1.2, padding: '0.65rem 0.85rem', borderRadius: '1rem' }}>
           Review Stack <ArrowRight size={14} />
        </button>
        <button onClick={onCreateCourse} className="btn btn-ghost" style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
           <PlusIcon size={14} /> Course
        </button>
     </div>
  </motion.div>
);

const PremiumCategoryListRow = ({ cat, onEdit, onDelete, onView, onCreateCourse, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
    className="premium-glow-card"
    style={{ backgroundColor: 'var(--color-surface)', padding: '1rem 1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', border: '1px solid var(--color-border)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
       <div style={{ width: '3.5rem', height: '3rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <img src={cat.Thumbnail || "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
       </div>
       <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{cat.Category_Name}</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{cat.Course_Description}</p>
       </div>
    </div>

    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
       <button onClick={onView} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-surface)', fontWeight: 800, color: 'var(--color-text)', cursor: 'pointer' }}>Manage courses</button>
       <button onClick={onCreateCourse} style={{ padding: '0.6rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer' }}><PlusIcon size={16}/> New Course</button>
       <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }} />
       <button onClick={onEdit} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--color-surface-muted)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Settings2 size={16}/></button>
       <button onClick={onDelete} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: 'none', background: '#fff1f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16}/></button>
    </div>
  </motion.div>
);

const CategoryModal = ({ mode, category, categories, onClose, refresh, showToast }) => {
  const { authFetch, clearCache } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    Category_Name: '',
    slug: '',
    Parent_ID: 'root',
    Course_Description: '',
    Icon: '📁',
    Thumbnail: ''
  });

  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        Category_Name: category.Category_Name,
        slug: category.slug || '',
        Parent_ID: category.Parent_ID || 'root',
        Course_Description: category.Course_Description,
        Icon: category.Icon || '📁',
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
        Icon: formData.Icon || '📁',
        Thumbnail: formData.Thumbnail.length > 200 ? '' : formData.Thumbnail // Guard against DB limits
      };

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) { 
          showToast(`Category Saved`); 
          clearCache('admin_categories');
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

const Input = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
     <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
     <input {...props} style={{ width: '100%', padding: '0.85rem 1.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }} />
  </div>
);

export default AdminCategories;
