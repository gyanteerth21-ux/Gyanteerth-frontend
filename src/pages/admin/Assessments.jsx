import { 
  Search, Edit, Target, Clock, Award, Trash2, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, CheckCircle2, Filter, X, Save, Calendar,
  ChevronRight, Bookmark, BarChart3, Settings2, Layout, BookOpen, Grid, List, Globe, Download, FileUp
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API, TRAINER_API } from '../../config';

const AdminAssessments = () => {
  const { user, authFetch, smartFetch } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [toast, setToast] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [editingAsm, setEditingAsm] = useState(null);
  const [viewingResults, setViewingResults] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };


  const isTrainer = user?.role === 'trainer';
  const BASE_URL = isTrainer ? TRAINER_API : ADMIN_API;

  const fetchEverything = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // For trainers, we might need a different endpoint to get their specific courses
      const statusEndpoint = isTrainer ? `${TRAINER_API}/trainer_course_ids` : `${ADMIN_API}/courses/ids-by-status`;
      const statusData = await smartFetch(statusEndpoint, { 
        cacheKey: isTrainer ? 'trainer_course_ids' : 'admin_course_ids',
        forceRefresh: true 
      });
      
      if (statusData) {
        let allIds = [];
        if (isTrainer) {
          allIds = statusData.course_ids || statusData.ids || [];
        } else {
          const { active = [], draft = [], inactive = [] } = statusData.courses || {};
          allIds = [...active, ...draft, ...inactive];
        }
        
        const allAsms = [];
        const courseRegistry = [];

        // Parallelize fetching course details for assessments using smartFetch
        const coursePromises = allIds.map(async (id) => {
           try {
              const detailsEndpoint = isTrainer ? `${TRAINER_API}/course/${id}/details` : `${ADMIN_API}/course/${id}/full-details`;
              const fullData = await smartFetch(detailsEndpoint, { cacheKey: `details_${id}` });
              if (fullData) {
                 const c = fullData.course || fullData;
                 return { id, data: c };
              }
           } catch (e) {}
           return null;
        });

        const courseResults = await Promise.all(coursePromises);

        for (const res of courseResults) {
           if (!res) continue;
           const { id, data: c } = res;
           courseRegistry.push({ 
              course_id: id, 
              course_title: c.course_title || c.title || 'Untitled Course',
              status: c.status || c.Status || 'active'
            });
           
           (c.modules || []).forEach(m => {
              const content = m.content || {};
              const relevantAsms = content.assessments || m.assessments || [];
              relevantAsms.forEach(a => {
                 allAsms.push({ 
                   ...a, 
                   assessment_id: a.assessment_id || a.Assessment_ID,
                   module_id: m.module_id || m.Module_ID,
                   module_title: m.title || m.Title, 
                   course_title: c.course_title || c.title || 'Untitled Course', 
                   course_id: id,
                   course_status: c.status || c.Status || 'active'
                 });
              });
           });
        }
        const clist = courseRegistry.map(c => {
           const count = allAsms.filter(a => a.course_id === c.course_id).length;
           return { ...c, count };
        }).filter(c => c.count > 0);
        setCourses(clist);
        setAssessments(allAsms);
      }
    } catch (err) {
      showToast('Data sync failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, smartFetch]);

  useEffect(() => { fetchEverything(); }, [fetchEverything]);

  const handleDelete = async (id, courseId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      const res = await authFetch(`${BASE_URL}/delete-assessment/${id}`, { method: 'DELETE' });
      if (res.ok) { 
        showToast('Assessment Deleted'); 
        if (courseId) clearCache(`details_${courseId}`);
        fetchEverything(); 
      }
      else showToast('Delete failed', 'error');
    } catch (err) { showToast('Network fail', 'error'); }
  };

  const filteredAssessments = assessments.filter(a => {
    const title = (a.title || a.Title || '').toLowerCase();
    const courseTitle = (a.course_title || '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || courseTitle.includes(searchQuery.toLowerCase());
    return (selectedCourse === 'all' || a.course_id === selectedCourse) && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', paddingBottom: '10rem' }}>
      
      {/* COMPACT COMMANDER HEADER */}
      {/* ── Domain Navigation (Courses) ── */}
      <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }} className="no-scrollbar">
         <button 
           onClick={() => setSelectedCourse('all')}
           style={{ 
             padding: '0.5rem 1rem', borderRadius: '1rem', 
             border: selectedCourse === 'all' ? '1px solid transparent' : '1px solid var(--color-border)', 
             backgroundColor: selectedCourse === 'all' ? '#f97316' : 'var(--color-surface)', 
             color: selectedCourse === 'all' ? 'white' : 'var(--color-text)', 
             fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
             boxShadow: selectedCourse === 'all' ? 'var(--shadow-md)' : 'none',
             display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
           }}
         >
           <Globe size={14} /> Every Course
           <span style={{ background: selectedCourse === 'all' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-muted)', color: selectedCourse === 'all' ? 'white' : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>{assessments.length}</span>
         </button>
         {courses.map(c => (
            <button 
              key={c.course_id}
              onClick={() => setSelectedCourse(c.course_id)}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '1rem', 
                border: selectedCourse === c.course_id ? '1px solid transparent' : '1px solid var(--color-border)', 
                backgroundColor: selectedCourse === c.course_id ? '#f97316' : 'var(--color-surface)', 
                color: selectedCourse === c.course_id ? 'white' : 'var(--color-text)', 
                fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                boxShadow: selectedCourse === c.course_id ? 'var(--shadow-md)' : 'none',
                display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap',
                opacity: (c.status === 'inactive' || c.Status === 'inactive') ? 0.7 : 1
              }}
            >
              <BookOpen size={14} /> 
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {c.course_title}
                    {(c.status === 'inactive' || c.Status === 'inactive') && (
                      <span style={{ fontSize: '0.5rem', background: '#ef4444', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '0.4rem', textTransform: 'uppercase' }}>Inactive</span>
                    )}
                 </div>
               </div>
              <span style={{ background: selectedCourse === c.course_id ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-muted)', color: selectedCourse === c.course_id ? 'white' : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>{c.count}</span>
            </button>
         ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2.5rem' }}>
         <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#f97316', marginBottom: '0.4rem' }}>
               <Award size={18} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Assessment Management</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', color: 'var(--color-text)' }}>Assessments Registry</h1>
         </div>
         
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
               type="text" 
               placeholder="Identify evaluation..." 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               style={{ width: '280px', padding: '0.85rem 1.5rem 0.85rem 3.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 650, outline: 'none', color: 'var(--color-text)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} 
              />
            </div>
            
            <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-muted)', padding: '0.35rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)' }}>
               <button onClick={() => setViewMode('grid')} style={{ padding: '0.6rem 0.85rem', borderRadius: '0.9rem', border: 'none', background: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'grid' ? '#f97316' : 'var(--color-text-muted)', cursor: 'pointer', boxShadow: viewMode === 'grid' ? 'var(--shadow-md)' : 'none', transition: 'all 0.3s' }}><Grid size={20}/></button>
               <button onClick={() => setViewMode('list')} style={{ padding: '0.6rem 0.85rem', borderRadius: '0.9rem', border: 'none', background: viewMode === 'list' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'list' ? '#f97316' : 'var(--color-text-muted)', cursor: 'pointer', boxShadow: viewMode === 'list' ? 'var(--shadow-md)' : 'none', transition: 'all 0.3s' }}><List size={20}/></button>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2.5rem var(--page-padding)' }}>
         {/* COMPACT DASHBOARD BAR */}
         <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '1rem' }} className="no-scrollbar">
            <CompactStat label="Total Exams" value={assessments.length} icon={<Target size={16} color="#f97316" />} />
            <CompactStat label="Active Status" value={assessments.filter(a => (a.status||a.Status) === 'active').length} icon={<CheckCircle2 size={16} color="var(--color-primary)" />} />
            <CompactStat label="System Hub" value="Assessments" icon={<Layout size={16} color="#3b82f6" />} />
         </div>
         <div className="arcade-container">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)', backgroundSize: '32px 32px' }} />


         <AnimatePresence mode="wait">
            {viewingResults ? (
               <AssessmentResultsView 
                 key="results"
                 asm={viewingResults} 
                 onBack={() => setViewingResults(null)} 
               />
            ) : loading ? (
              <motion.div 
                key="loading" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '10rem 0' }}
              >
                 <Loader2 size={40} className="animate-spin" color="#f97316" />
                 <p style={{ marginTop: '2rem', fontSize: '1rem', fontWeight: 950, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>FETCHING ASSESSMENTS...</p>
              </motion.div>
           ) : filteredAssessments.length === 0 ? (
              <motion.div 
                key="empty" 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '8rem 2rem', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '1px dashed var(--color-border-strong)' }}
              >
                 <Bookmark size={60} color="var(--color-border-strong)" style={{ marginBottom: '2rem' }} />
                 <h2>No Assessments Found</h2>
                 <p style={{ maxWidth: '400px', margin: '1rem auto 0' }}>It looks like there are no evaluations configured for this selection.</p>
              </motion.div>
           ) : viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '2.5rem' }}
              >
                 {filteredAssessments.map((a, index) => (
                   <PremiumAssessmentCard 
                      key={a.assessment_id} 
                      asm={a} 
                      index={index}
                      onDelete={() => handleDelete(a.assessment_id, a.course_id)}
                      onEdit={() => setEditingAsm(a)}
                      onManage={() => navigate(`/manage/course/${a.course_id}`)}
                      setViewingResults={setViewingResults}
                   />
                 ))}
              </motion.div>
           ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                 {filteredAssessments.map((a, index) => (
                   <PremiumAssessmentListRow 
                      key={a.assessment_id} 
                      asm={a} 
                      index={index}
                      onDelete={() => handleDelete(a.assessment_id, a.course_id)}
                      onEdit={() => setEditingAsm(a)}
                      onManage={() => navigate(`/manage/course/${a.course_id}`)}
                      setViewingResults={setViewingResults}
                   />
                 ))}
              </motion.div>
           )}
         </AnimatePresence>
         </div>
      </div>

      {editingAsm && <EditAssessmentModal asm={editingAsm} onClose={() => setEditingAsm(null)} showToast={showToast} refresh={fetchEverything} BASE_URL={BASE_URL} />}

      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          style={{ 
            position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 4000, 
            padding: '1.25rem 3rem', borderRadius: '4rem', 
            backgroundColor: toast.type === 'success' ? '#111827' : '#ef4444', 
            color: 'white', fontWeight: '900', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', 
            display: 'flex', alignItems: 'center', gap: '1rem' 
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} color="#10b981" /> : <AlertCircle size={20} color="white" />}
          {toast.message}
        </motion.div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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

const CompactStat = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1.15rem', minWidth: 'max-content' }}>
     <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
     <div>
        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1 }}>{value}</h4>
        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
     </div>
  </div>
);

const PremiumAssessmentCard = ({ asm, onDelete, onEdit, onManage, index, setViewingResults }) => {
  const status = asm.status || asm.Status;
  const isSuspended = status === 'inactive';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.25rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
      className="premium-glow-card"
    >
       <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle at 100% 0%, #f9731608 0%, transparent 60%)', pointerEvents: 'none' }} />
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
             <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', border: '1px solid #ffedd5' }}>
                <Target size={18} />
             </div>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>

                    {(asm.course_status === 'inactive') && (
                       <span style={{ fontSize: '0.45rem', background: '#ef4444', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '0.35rem', fontWeight: 900 }}>INACTIVE COURSE</span>
                    )}
                 </div>
                 <h3 style={{ margin: 0, fontSize: '1rem' }}>{asm.title || asm.Title}</h3>
              </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
             <button onClick={onEdit} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={12}/></button>
             <button onClick={onDelete} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', backgroundColor: '#fff1f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={12}/></button>
          </div>
       </div>

       <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-text)' }}>{asm.course_title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
             <BookOpen size={12} color="var(--color-text-light)" />
             <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{asm.module_title}</span>
          </div>
       </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.85rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <ASInfo icon={<Clock size={12} color="#3b82f6"/>} label="Limit" value={`${asm.duration}m`} />
          <ASInfo icon={<Award size={12} color="#f97316"/>} label="Target" value={`${asm.passing_mark}/${asm.total_mark}`} />
       </div>

        <button onClick={onManage} className="btn btn-ghost" style={{ width: '100%', padding: '0.65rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 800 }}>
           Assessment Design <Settings2 size={14} />
        </button>

        <button 
          onClick={() => setViewingResults(asm)}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: '#0f172a', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 900, cursor: 'pointer' }}
        >
          <BarChart3 size={18} /> Analyze Results
        </button>
    </motion.div>
  );
};

const PremiumAssessmentListRow = ({ asm, onDelete, onEdit, onManage, index, setViewingResults }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
    className="premium-glow-card"
    style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem 2rem', borderRadius: '1.75rem', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
  >
     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1.5 }}>
        <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '1rem', backgroundColor: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Target size={22} />
        </div>
        <div>
           <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {asm.title || asm.Title}
              {asm.course_status === 'inactive' && (
                <span style={{ fontSize: '0.45rem', background: '#ef4444', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '0.35rem', fontWeight: 900 }}>INACTIVE</span>
              )}
           </h4>
           <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{asm.module_title} • {asm.course_title}</div>
        </div>
     </div>

     <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Clock size={14} color="#3b82f6" />
           <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{asm.duration}m</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Award size={14} color="#f97316" />
           <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{asm.passing_mark}/{asm.total_mark}</span>
        </div>
     </div>

     <div style={{ display: 'flex', gap: '0.75rem' }}>
         <button 
           onClick={() => setViewingResults(asm)}
           style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', background: '#0f172a', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
         >
           <BarChart3 size={14} /> Results
         </button>
         <button onClick={onManage} style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Design</button>
        <button onClick={onEdit} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={16}/></button>
        <button onClick={onDelete} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', background: '#fff1f2', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16}/></button>
     </div>
  </motion.div>
);

const ASInfo = ({ icon, label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{icon} {label}</div>
     <div style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--color-text)' }}>{value}</div>
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
        // Note: authFetch should handle NOT setting Content-Type for FormData
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

const AssessmentResultsView = ({ asm, onBack }) => {
  const { user, authFetch } = useAuth();
  const isTrainer = user?.role === 'trainer';
  const BASE_URL = isTrainer ? TRAINER_API : ADMIN_API;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = `${TRAINER_API}/export_assessment_results?course_id=${asm.course_id}&assessment_id=${asm.assessment_id}`;
      const res = await authFetch(url);
      
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Results_${asm.title || 'Export'}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        console.error("Failed to export results");
      }
    } catch (e) {
      console.error("Error exporting:", e);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const url = `${TRAINER_API}/assessment_results?assessment_id=${asm.assessment_id}&course_id=${asm.course_id}`;
        
        const res = await authFetch(url);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch results:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [asm.assessment_id, asm.course_id, authFetch]);

  const filtered = results.filter(r => {
    const nameMatch = (r.student_name || '').toLowerCase().includes(search.toLowerCase()) || 
                      (r.student_email || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'All' || r.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontWeight: 800, cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back to Registry
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{asm.title || asm.Title}</h2>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Performance Analysis Dashboard</p>
           </div>
           <button 
             onClick={handleExport} 
             disabled={exporting}
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '1rem', background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, cursor: exporting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
           >
             {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
             {exporting ? 'Exporting...' : 'Export Excel'}
           </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '2rem', padding: '2rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
           <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Search student by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', outline: 'none', fontWeight: 700 }} />
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status:</span>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Status</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>
           </div>
        </div>

        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--color-primary)" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--color-border)', borderRadius: '1.5rem' }}>
            <Bookmark size={40} color="var(--color-border)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>No results found for this selection.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Student Identity</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Course Name</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>Performance Score</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>Time Utilized</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  let timeTakenMins = 0;
                  if (r.start_time && r.end_time) {
                    const start = new Date(r.start_time);
                    const end = new Date(r.end_time);
                    const diffMs = end - start;
                    timeTakenMins = Math.max(0, Math.round(diffMs / 60000));
                  }
                  
                  const isPassed = r.status === 'Passed';

                  return (
                    <tr key={r.attempt_id || i} style={{ backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', overflow: 'hidden' }}>
                      <td style={{ padding: '1.25rem 1rem', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem' }}>
                        <div style={{ fontWeight: 900, color: 'var(--color-text)' }}>{r.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{r.student_email}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 800, color: 'var(--color-text)' }}>{r.course_name}</td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 950, color: isPassed ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                        {r.score}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '0.85rem', background: 'rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: 900 }}>
                          <Clock size={12} color="#6366f1" /> {timeTakenMins}m
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'center', borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                        <span style={{ padding: '0.5rem 1.25rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', background: isPassed ? '#10b98120' : '#ef444420', color: isPassed ? '#10b981' : '#ef4444', border: `1px solid ${isPassed ? '#10b981' : '#ef4444'}40` }}>
                          {isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminAssessments;
