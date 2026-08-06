import { 
  Search, Edit, Target, Clock, Award, Trash2, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, CheckCircle2, Filter, X, Save, Calendar,
  ChevronRight, Bookmark, BarChart3, Settings2, Layout, BookOpen, Grid, List, Globe, Download, FileUp
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API, TRAINER_API } from '../../config';
import EditAssessmentModal from '../../components/admin/EditAssessmentModal';
import { PremiumAssessmentCard, PremiumAssessmentListRow } from '../../components/admin/AssessmentCards';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { useViewMode } from '../../hooks/useViewMode';


const AdminAssessments = () => {
  const { user, authFetch, smartFetch } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewMode, setViewMode } = useViewMode('admin_assessments_view_mode', 'grid');
  const [toast, setToast] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');

  const filteredByCourse = useMemo(() => assessments.filter(a => selectedCourse === 'all' || a.course_id === selectedCourse), [assessments, selectedCourse]);
  const { searchQuery, setSearchQuery, filteredData: filteredAssessments } = useSearchFilter(filteredByCourse, ['title', 'Title', 'course_title']);
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

  const handleCourseFilter = (courseId) => {
    setSelectedCourse(courseId);
  };

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
                  let displayTime = '';
                  if (r.start_time && r.end_time) {
                    const start = new Date(r.start_time);
                    const end = new Date(r.end_time);
                    const diffMs = end - start;
                    timeTakenMins = Math.max(0, Math.round(diffMs / 60000));
                    
                    const fmt = d => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
                    displayTime = `${fmt(start)} - ${fmt(end)}`;
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '0.85rem', background: 'rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: 900 }}>
                            <Clock size={12} color="#6366f1" /> {timeTakenMins}m
                          </div>
                          {displayTime && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {displayTime}
                            </div>
                          )}
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
