import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Edit, Trash2, CheckCircle2, AlertCircle, 
  BookOpen, Users, Layers, ArrowRight, Loader2, Award, ChevronRight,
  Monitor, Play, FileText, Settings, Layout, Archive, Globe, Clock,
  ArrowLeft, Palette, ShieldCheck, Zap, Save, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API } from '../../config';
import { CreateCourseModal, EditCourseModal } from '../../components/admin/CourseModals';

const AdminCourses = () => {
  const navigate = useNavigate();
  const { user, smartFetch, authFetch, clearCache } = useAuth();
  const [searchParams] = useSearchParams();
  const urlCategoryId = searchParams.get('categoryId');
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('draft'); 
  const [activeCategory, setActiveCategory] = useState(urlCategoryId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };


  const fetchAllData = useCallback(async (force = false) => {
    if (!user) return;
    try {
      // 1. Concurrent Fetch Categories & Status Metadata (SWR)
      const [catData, statusData] = await Promise.all([
        smartFetch(`${ADMIN_API}/get-categories`, { cacheKey: 'admin_categories', forceRefresh: force }),
        smartFetch(`${ADMIN_API}/courses/ids-by-status`, { cacheKey: 'admin_course_ids', forceRefresh: force })
      ]);

      if (catData) setCategories(catData.categories || []);

      if (statusData) {
        const { active = [], draft = [] } = statusData.courses || {};
        const allMeta = [
          ...active.map(id => ({ id, status: 'active' })),
          ...draft.map(id => ({ id, status: 'draft' }))
        ];

        // 2. 🔥 CONCURRENT BATCH FETCHING (Parallelized SWR)
        const detailPromises = allMeta.map(async (meta) => {
          const data = await smartFetch(`${ADMIN_API}/course/${meta.id}/full-details`, { 
            cacheKey: `details_${meta.id}`,
            forceRefresh: force 
          });
          if (!data) return null;
          const c = data.course || data;
          return {
            ...c,
            course_id: meta.id,
            status: meta.status,
            course_title: c.course_title || c.title || 'Untitled Course',
            course_description: c.course_description || c.description || 'No description available',
            thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
          };
        });

        const detailResults = (await Promise.all(detailPromises)).filter(Boolean);
        setCourses(detailResults);
      }
    } catch (err) { 
      console.error("Courses sync failed", err);
      showToast('Sync failed', 'error'); 
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

  useEffect(() => { fetchAllData(); fetchTrainers(); }, [fetchAllData, fetchTrainers]);

  const handlePublish = async (courseId) => {
    if (!window.confirm('Mobilize live?')) return;
    setIsPublishing(true);
    try {
      const res = await authFetch(`${ADMIN_API}/activate/${courseId}`, { method: 'PUT' });
      if (res.ok) { 
        showToast('Strategic Deployment Successful'); 
        clearCache('admin_course_ids'); // Bust IDs cache
        clearCache(`details_${courseId}`); // Bust specific detail cache
        fetchAllData(true); 
        setActiveTab('active'); 
      }
      else { const d = await res.json(); showToast(d.detail || d.message || 'Denied', 'error'); }
    } catch (err) { showToast('Sync failed', 'error'); }
    finally { setIsPublishing(false); }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Purge asset?')) return;
    try {
      const res = await authFetch(`${ADMIN_API}/delete-course/${courseId}`, { method: 'DELETE' });
      if (res.ok) { 
        showToast('Asset Purged'); 
        clearCache('admin_course_ids');
        clearCache(`details_${courseId}`);
        fetchAllData(true); 
      }
      else showToast('Restricted', 'error');
    } catch (err) { showToast('Sync failed', 'error'); }
  };

  const filteredCourses = courses.filter(c => {
    const matchesStatus = c.status === activeTab;
    const matchesCategory = activeCategory === 'all' || c.category_id === activeCategory;
    const matchesSearch = c.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getCount = (status) => courses.filter(c => c.status === status && (activeCategory === 'all' || c.category_id === activeCategory)).length;
  const currentCategoryName = categories.find(bc => bc.Category_ID === activeCategory)?.Category_Name || 'Global Catalog';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-muted)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', paddingBottom: '10rem' }}>
      
      {/* REFINED HEADER */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 2.5rem' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <button onClick={() => navigate('/admin/categories')} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-text-light)', border: 'none', background: 'none', fontWeight: 800, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em' }} >
               <ArrowLeft size={16} /> Back to Categories
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f97316', marginBottom: '0.4rem' }}>
                     <BookOpen size={18} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Course Repository</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>{currentCategoryName}</h1>
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" placeholder="Filter architecture..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '280px', padding: '0.65rem 1rem 0.65rem 2.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 650, outline: 'none' }} />
                  </div>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.65rem 1.75rem', borderRadius: '1.15rem', fontWeight: 950, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-md)' }}
                  >
                    <Plus size={16} /> New Artifact
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 2.5rem' }}>
         
         {/* DOMAIN TABS */}
         <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }} className="no-scrollbar">
            <button 
              onClick={() => { setActiveCategory('all'); navigate('/admin/courses', { replace: true }); }}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', border: activeCategory === 'all' ? '1px solid transparent' : '1px solid var(--color-border)', backgroundColor: activeCategory === 'all' ? 'var(--color-primary)' : 'var(--color-surface)', color: activeCategory === 'all' ? 'white' : 'var(--color-text)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeCategory === 'all' ? 'var(--shadow-md)' : 'none' }}
            >
              Global Catalog
            </button>
            {categories.map(c => (
               <button 
                 key={c.Category_ID}
                 onClick={() => { setActiveCategory(c.Category_ID); navigate(`/admin/courses?categoryId=${c.Category_ID}`, { replace: true }); }}
                 style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', border: activeCategory === c.Category_ID ? '1px solid transparent' : '1px solid var(--color-border)', backgroundColor: activeCategory === c.Category_ID ? 'var(--color-primary)' : 'var(--color-surface)', color: activeCategory === c.Category_ID ? 'white' : 'var(--color-text)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeCategory === c.Category_ID ? 'var(--shadow-md)' : 'none' }}
               >
                 {c.Category_Name}
               </button>
            ))}
         </div>

         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', padding: '0.4rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1.75rem', border: '1px solid var(--color-border)', gap: '0.4rem' }}>
               <SmallTab active={activeTab === 'draft'} label="Development" count={getCount('draft')} onClick={() => setActiveTab('draft')} icon={<Clock size={12}/>} activeColor="#f97316" />
               <SmallTab active={activeTab === 'active'} label="Live Operation" count={getCount('active')} onClick={() => setActiveTab('active')} icon={<Zap size={12}/>} activeColor="#10b981" />
            </div>
         </div>

         <div className="arcade-container">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)', backgroundSize: '32px 32px' }} />


         {loading ? (
            <div style={{ textAlign: 'center', padding: '10rem 0' }}>
               <Loader2 size={40} className="animate-spin" color="#10b981" />
               <p style={{ marginTop: '2rem', fontWeight: 950, color: '#ced4da' }}>SYNCING...</p>
            </div>
         ) : filteredCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 2rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '3rem', border: '1px dashed #e2e8f0' }}>
               <Palette size={60} color="#e2e8f0" style={{ marginBottom: '2rem' }} />
               <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)' }}>Workspace Empty</h2>
            </div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
               {filteredCourses.map(course => (
                 <PremiumCourseCardSmall 
                   key={course.course_id} 
                   course={course} 
                   onEdit={() => setSelectedCourse(course)}
                   onDelete={() => handleDelete(course.course_id)}
                   onManage={() => navigate(`/manage/course/${course.course_id}`)}
                   onPublish={() => handlePublish(course.course_id)}
                   isPublishing={isPublishing}
                 />
               ))}
            </div>
         )}
         </div>
      </div>

      {isCreateModalOpen && <CreateCourseModal onClose={() => setIsCreateModalOpen(false)} trainers={trainers} categories={categories} showToast={showToast} refresh={fetchAllData} initialCategoryId={activeCategory !== 'all' ? activeCategory : ''} />}
      {selectedCourse && <EditCourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} trainers={trainers} categories={categories} showToast={showToast} refresh={fetchAllData} />}
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3500, padding: '1rem 2.5rem', borderRadius: '4rem', backgroundColor: '#111827', color: 'white', fontWeight: '900', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.5s' }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
          {toast.message}
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
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
          box-shadow: 0 15px 45px rgba(2, 6, 23, 0.15); /* Light mode navy */
          background-image: linear-gradient(135deg, transparent 95%, rgba(0,0,0,0.02) 100%), radial-gradient(circle at 2px 2px, rgba(0,0,0,0.01) 1px, transparent 0);
          background-size: 100% 100%, 30px 30px;
        }
        .dark .premium-glow-card:hover {
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.15); /* Dark mode white glow */
          background-image: linear-gradient(135deg, transparent 95%, rgba(255,255,255,0.05) 100%), radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
        }
      `}</style>
    </div>
  );
};

const SmallTab = ({ active, label, count, onClick, icon, activeColor }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem', borderRadius: '1.25rem', border: 'none', cursor: 'pointer', backgroundColor: active ? 'var(--color-surface)' : 'transparent', color: active ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 950, fontSize: '0.8rem', transition: 'all 0.3s', boxShadow: active ? 'var(--shadow-sm)' : 'none' }}>
     <div style={{ color: active ? activeColor : 'var(--color-text-muted)' }}>{icon}</div>
     {label}
     {count > 0 && <span style={{ backgroundColor: active ? `${activeColor}20` : 'var(--color-surface-muted)', color: active ? activeColor : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.6rem' }}>{count}</span>}
  </button>
);

const PremiumCourseCardSmall = ({ course, onEdit, onDelete, onManage, onPublish, isPublishing }) => {
  const isDraft = course.status === 'draft';
  const isLive = course.status === 'active';

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', transition: 'all 0.4s', position: 'relative' }} className="premium-glow-card">
       <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
          <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
          
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
             <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.65rem', backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={14}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.65rem', backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14}/></button>
          </div>
 
          <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
             {isDraft ? (
                <div style={{ backgroundColor: 'rgba(249,115,22,0.9)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.45rem 1rem', borderRadius: '0.75rem', fontWeight: 950, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                   DRAFT
                </div>
             ) : (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.45rem 1rem', borderRadius: '0.75rem', fontWeight: 950, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                   ACTIVE
                </div>
             )}
          </div>
       </div>
 
       <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
             <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: 'var(--color-text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.course_title}</h3>
             <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.4, height: '2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.course_description}</p>
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
             <MinStat icon={<Users size={12} color="#3b82f6"/>} value={course.students_count || 0} />
             <MinStat icon={<Layers size={12} color="#f97316"/>} value={`${course.modules?.length || 0} Layers`} />
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: isDraft ? '1fr 1fr' : '1fr', gap: '0.75rem', marginTop: 'auto' }}>
             {isDraft && (
                <button onClick={onPublish} disabled={isPublishing} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                   <ShieldCheck size={14} /> Publish
                </button>
             )}
             <button onClick={onManage} style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                Studio Architect <ArrowRight size={14} />
             </button>
          </div>
       </div>
    </div>
  );
};

const MinStat = ({ icon, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
     <div style={{ width: '2rem', height: '2rem', borderRadius: '0.65rem', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>{icon}</div>
     <span style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--color-text)' }}>{value}</span>
  </div>
);

export default AdminCourses;
