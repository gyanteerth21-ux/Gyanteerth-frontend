import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../shared/AuthContext';
import { Search, Mail, BookOpen, TrendingUp, Filter, Users, Loader2, ChevronDown, Globe, Upload, X, CheckCircle2, AlertCircle, Database, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API, TRAINER_API } from '../../config';



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

const AdminStudents = () => {
  const { user, smartFetch, authFetch, clearCache } = useAuth();
  const [students, setStudents] = useState([]);
  const [uniqueStudents, setUniqueStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Skeleton Loader ── */
  const TableSkeleton = () => (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', gap: '2rem', alignItems: 'center' }}>
          <div style={{ flex: 1.5, display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: '#f1f5f9', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ height: '16px', width: '60%', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
               <div style={{ height: '12px', width: '40%', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}><div style={{ height: '16px', width: '80%', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} /></div>
          <div style={{ flex: 1 }}><div style={{ height: '24px', width: '100%', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} /></div>
          <div style={{ flex: 0.5, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.85rem', background: '#f1f5f9', animation: 'pulse 1.5s infinite ease-in-out' }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [progressFilter, setProgressFilter] = useState('All'); 
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
        const statsData = await smartFetch(`${ADMIN_API}/enrollment-stats`, { cacheKey: 'admin_enrollment_stats', forceRefresh: true });
        let courseList = statsData?.data || [];
        
        if (courseList.length === 0) {
            const courseData = await smartFetch(`${ADMIN_API}/courses/ids-by-status`, { cacheKey: 'admin_course_ids', forceRefresh: true });
            if (courseData) {
                const { active, draft, inactive } = courseData.courses || {};
                const ids = [...(active || []), ...(draft || []), ...(inactive || [])];
                courseList = ids.map(id => ({ course_id: id, course_title: 'Enrolled Course' }));
            }
        }
        
        const progressPromises = courseList.map(async (course) => {
            const id = course.course_id || course;
            let title = course.course_title || 'Enrolled Course';
            
            try {
                const progressData = await smartFetch(`${TRAINER_API}/course/${id}/students-progress`, { cacheKey: `st_prog_${id}`, forceRefresh: true });
                if (progressData && progressData.data) {
                    const sData = progressData.data || [];
                    return sData.map((st, index) => ({
                        id: `${id}-${st.user_id || index}`,
                        course_id: id,
                        email: st.email || st.user_id, 
                        name: st.user_name || 'Anonymous Student',
                        progress: st.progress_percentage || 0,
                        course_title: title,
                        completed_modules: st.completed_modules,
                        total_modules: st.total_modules
                    }));
                }
            } catch(e) {
                console.error(`Error fetching progress for course ${id}:`, e);
            }
            return [];
        });

        const progressResults = await Promise.all(progressPromises);
        const allStudents = progressResults.flat();
        
        const clist = courseList.map(c => {
           const id = c.course_id;
           const count = allStudents.filter(s => s.course_id === id).length;
           return { id, title: c.course_title, count };
        }).filter(c => c.count > 0);

        // Aggregate unique students
        const uniqueMap = new Map();
        allStudents.forEach(st => {
            const key = st.email;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, {
                    email: st.email,
                    name: st.name,
                    enrollments: [],
                    avgProgress: 0
                });
            }
            uniqueMap.get(key).enrollments.push(st);
        });

        const uniqueArr = Array.from(uniqueMap.values()).map(u => {
            const totalProg = u.enrollments.reduce((sum, e) => sum + e.progress, 0);
            u.avgProgress = Math.round(totalProg / u.enrollments.length) || 0;
            return u;
        }).sort((a,b) => b.avgProgress - a.avgProgress);

        setStudents(allStudents.sort((a,b) => b.progress - a.progress));
        setUniqueStudents(uniqueArr);
        setAvailableCourses(clist);
        if (uniqueArr.length > 0) setSelectedUser(uniqueArr[0]);
    } catch(err) {
        console.error("Failed to fetch students roster:", err);
    } finally {
        setLoading(false);
    }
  }, [user, smartFetch]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleBulkImport = async (file) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authFetch(`${ADMIN_API}/bulk_create_users`, {
        method: 'POST',
        // Note: authFetch should NOT have Content-Type header for FormData, 
        // the browser will set it with the boundary.
        body: formData
      });

      if (response.ok) {
        showToast('Students imported successfully');
        setShowImportModal(false);
        fetchStudents();
      } else {
        const errorData = await response.json();
        console.error("Bulk Import Error Details:", errorData);
        const detail = Array.isArray(errorData.detail) ? errorData.detail[0]?.msg : errorData.detail;
        showToast(detail ? `Import failed: ${detail}` : 'Unable to import data', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (st.name || '').toLowerCase().includes(q) || (st.email || '').toLowerCase().includes(q) || (st.course_title || '').toLowerCase().includes(q);
      const matchesCourse = courseFilter === 'All' || st.course_id === courseFilter;
      
      let matchesProgress = true;
      if (progressFilter === 'Completed') matchesProgress = st.progress === 100;
      else if (progressFilter === 'InProgress') matchesProgress = st.progress > 0 && st.progress < 100;
      else if (progressFilter === 'NotStarted') matchesProgress = st.progress === 0;

      return matchesSearch && matchesCourse && matchesProgress;
    });
  }, [students, searchQuery, courseFilter, progressFilter]);

  const filteredUniqueStudents = useMemo(() => {
    return uniqueStudents.filter(st => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (st.name || '').toLowerCase().includes(q) || (st.email || '').toLowerCase().includes(q);
      
      let matchesProgress = true;
      if (progressFilter === 'Completed') matchesProgress = st.avgProgress === 100;
      else if (progressFilter === 'InProgress') matchesProgress = st.avgProgress > 0 && st.avgProgress < 100;
      else if (progressFilter === 'NotStarted') matchesProgress = st.avgProgress === 0;

      return matchesSearch && matchesProgress;
    });
  }, [uniqueStudents, searchQuery, progressFilter]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
              <Users size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Student Intelligence</span>
           </div>
           <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>Student Roster</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '300px', padding: '0.85rem 1rem 0.85rem 2.75rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
            />
          </div>
          <button 
            onClick={() => setShowImportModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: 'var(--shadow-lg)' }}
          >
            <Upload size={18} /> Bulk Import
          </button>
        </div>
      </div>

      {/* ── Domain Navigation (Categories) ── */}
      <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }} className="no-scrollbar">
         <button 
           onClick={() => setCourseFilter('All')}
           style={{ 
             padding: '0.5rem 1rem', borderRadius: '1rem', 
             border: courseFilter === 'All' ? '1px solid transparent' : '1px solid var(--color-border)', 
             backgroundColor: courseFilter === 'All' ? 'var(--color-primary)' : 'var(--color-surface)', 
             color: courseFilter === 'All' ? 'white' : 'var(--color-text)', 
             fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
             boxShadow: courseFilter === 'All' ? 'var(--shadow-md)' : 'none',
             display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
           }}
         >
           <Globe size={14} /> Global Catalog
           <span style={{ background: courseFilter === 'All' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-muted)', color: courseFilter === 'All' ? 'white' : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>{students.length}</span>
         </button>
         {availableCourses.map(c => (
            <button 
              key={c.id}
              onClick={() => setCourseFilter(c.id)}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '1rem', 
                border: courseFilter === c.id ? '1px solid transparent' : '1px solid var(--color-border)', 
                backgroundColor: courseFilter === c.id ? 'var(--color-primary)' : 'var(--color-surface)', 
                color: courseFilter === c.id ? 'white' : 'var(--color-text)', 
                fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                boxShadow: courseFilter === c.id ? 'var(--shadow-md)' : 'none',
                display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
              }}
            >
              <BookOpen size={14} /> {c.title}
              <span style={{ background: courseFilter === c.id ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-muted)', color: courseFilter === c.id ? 'white' : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>{c.count}</span>
            </button>
         ))}
      </div>


      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.25rem 1.75rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '0.85rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1 }}>{uniqueStudents.length}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Total Unique Students</div>
          </div>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '1.25rem 1.75rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '0.85rem', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1 }}>{students.length}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Total Enrollments</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 900, cursor: 'pointer',
            color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            position: 'relative'
          }}
        >
          User Directory
          {activeTab === 'users' && <motion.div layoutId="tabIndicator" style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '3px', background: 'var(--color-primary)', borderRadius: '3px' }} />}
        </button>
        <button 
          onClick={() => setActiveTab('enrollments')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 900, cursor: 'pointer',
            color: activeTab === 'enrollments' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            position: 'relative'
          }}
        >
          Course Enrollments
          {activeTab === 'enrollments' && <motion.div layoutId="tabIndicator" style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '3px', background: 'var(--color-primary)', borderRadius: '3px' }} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
              <Users size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Platform Analytics</span>
           </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
            {activeTab === 'users' ? 'Unique User Profiles' : 'Global Student Roster'}
          </h1>
          <p style={{ margin: 0, maxWidth: '500px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
             {activeTab === 'users' ? 'Browse distinct users and their combined platform metrics.' : 'Manage and track the progress of all students enrolled across the platform ecosystem.'}
          </p>
        </div>
        
        {/* SECONDARY FILTERS (Search & Progress) */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
             <input 
               type="text" 
               placeholder="Search students..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ width: '260px', padding: '0.85rem 1rem 0.85rem 3rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 650, outline: 'none', color: 'var(--color-text)', transition: 'border-color 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} 
             />
          </div>

          <div style={{ position: 'relative' }}>
             <select 
               value={progressFilter} 
               onChange={(e) => setProgressFilter(e.target.value)}
               style={{ appearance: 'none', padding: '0.85rem 2.85rem 0.85rem 1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minWidth: '160px' }}
             >
               <option value="All">All Progress</option>
               <option value="Completed">Completed (100%)</option>
               <option value="InProgress">In Progress (1-99%)</option>
               <option value="NotStarted">Not Started (0%)</option>
             </select>
             <Filter size={14} style={{ position: 'absolute', right: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div style={{ display: 'flex', gap: '1.5rem', height: '650px', alignItems: 'stretch' }}>
           {/* Left Sidebar - User List */}
           <div style={{ flex: '1', minWidth: '320px', maxWidth: '380px', background: 'var(--color-surface)', borderRadius: '1.5rem', border: '1px solid var(--color-border)', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }} className="no-scrollbar">
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', position: 'sticky', top: 0, zIndex: 10 }}>
                 <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--color-text)' }}>Directory List</h3>
                 <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>{filteredUniqueStudents.length} Students found</div>
              </div>
              {filteredUniqueStudents.map(st => (
                <div key={st.email} onClick={() => setSelectedUser(st)} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', background: selectedUser?.email === st.email ? 'var(--color-primary-bg)' : 'transparent', borderLeft: selectedUser?.email === st.email ? '4px solid var(--color-primary)' : '4px solid transparent', transition: 'all 0.2s' }}>
                   <div style={{ fontWeight: 900, color: 'var(--color-text)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.name || st.email.split('@')[0]}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Mail size={12}/> {st.email}</div>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4f46e5', background: '#eef2ff', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>{st.enrollments.length} Courses</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: st.avgProgress === 100 ? 'var(--color-primary)' : '#64748b' }}>Avg: {st.avgProgress}%</span>
                   </div>
                </div>
              ))}
           </div>
           
           {/* Right Panel - Details */}
           <div style={{ flex: '2', background: 'var(--color-surface)', borderRadius: '1.5rem', border: '1px solid var(--color-border)', padding: '1.75rem', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }} className="no-scrollbar">
              {selectedUser ? (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedUser.email}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                       <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 950, border: '1px solid rgba(16,185,129,0.1)' }}>
                         {(selectedUser.name || 'S').charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-text)' }}>{selectedUser.name || selectedUser.email.split('@')[0]}</h2>
                         <p style={{ margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}><Mail size={14}/> {selectedUser.email}</p>
                       </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}><BookOpen size={16} color="var(--color-primary)" /> Registered Courses</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                       {selectedUser.enrollments.map(enr => (
                          <div key={enr.course_id} style={{ padding: '1.15rem', borderRadius: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                             <div style={{ flex: 1 }}>
                               <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.65rem' }}>{enr.course_title}</div>
                               <div style={{ width: '100%', height: '6px', background: 'var(--color-bg)', borderRadius: '1rem', overflow: 'hidden' }}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${enr.progress || 0}%` }} transition={{ duration: 1 }} style={{ width: `${enr.progress}%`, height: '100%', background: enr.progress === 100 ? 'var(--color-primary)' : '#4f46e5' }} />
                               </div>
                             </div>
                             <div style={{ width: '60px', textAlign: 'right', fontWeight: 900, color: enr.progress === 100 ? 'var(--color-primary)' : '#4f46e5', fontSize: '1rem' }}>
                                {enr.progress || 0}%
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              ) : (
                 <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                    <Users size={48} style={{ marginBottom: '1.25rem', color: 'var(--color-text-muted)' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Select a User</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500, marginTop: '0.5rem' }}>Choose a student from the directory to view their complete profile and metrics.</p>
                 </div>
              )}
           </div>
        </div>
      ) : (
      <div style={{ background: 'var(--color-surface)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <th style={{ padding: '1.5rem 2rem', fontWeight: 900 }}>Student Profile</th>
                <th style={{ padding: '1.5rem 2rem', fontWeight: 900 }}>Enrolled Course</th>
                <th style={{ padding: '1.5rem 2rem', fontWeight: 900 }}>Learning Progress</th>
                <th style={{ padding: '1.5rem 2rem', fontWeight: 900, textAlign: 'right' }}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: 0 }}><TableSkeleton /></td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '8rem', textAlign: 'center' }}>
                     <Users size={56} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1.5rem auto', opacity: 0.3 }} />
                     <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>No students found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                   {filteredStudents.map((st, i) => (
                     <motion.tr 
                       key={st.id}
                       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}
                       style={{ borderBottom: i === filteredStudents.length - 1 ? 'none' : '1px solid var(--color-border)', transition: 'background 0.2s' }}
                     >
                       <td style={{ padding: '1.5rem 2rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <div style={{ 
                             width: '3rem', height: '3rem', borderRadius: '1rem', 
                             backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                             display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem',
                             border: '1px solid rgba(16,185,129,0.1)'
                           }}>
                             {(st.name || 'S').charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '1rem' }}>{st.name || st.username}</div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                               <Mail size={12} /> {st.email.length > 25 ? st.email.slice(0,25) + '...' : st.email}
                             </div>
                           </div>
                         </div>
                       </td>
                       <td style={{ padding: '1.5rem 2rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 700 }}>
                           <BookOpen size={16} style={{ color: 'var(--color-primary)', opacity: 0.8 }} /> {st.course_title}
                         </div>
                       </td>
                       <td style={{ padding: '1.5rem 2rem' }}>
                         <div style={{ width: '100%', maxWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                              <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                              <span style={{ color: st.progress === 100 ? 'var(--color-primary)' : '#4f46e5' }}>{st.progress || 0}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-bg)', borderRadius: '1rem', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${st.progress || 0}%` }} transition={{ duration: 1 }} style={{ width: `${st.progress || 0}%`, height: '100%', backgroundColor: st.progress === 100 ? 'var(--color-primary)' : '#4f46e5', borderRadius: '1rem' }} />
                            </div>
                         </div>
                       </td>
                       <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                         <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => window.location.href = `mailto:${st.email}`} style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.85rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                               <Mail size={16} />
                            </button>
                            <button style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.85rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                               <TrendingUp size={16} />
                            </button>
                         </div>
                       </td>
                     </motion.tr>
                   ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
      {showImportModal && (
        <BulkImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={handleBulkImport}
          loading={actionLoading}
        />
      )}

      {toast && createPortal(
        <div style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000001, padding: '1.15rem 3rem', borderRadius: '4rem', backgroundColor: '#111827', color: 'white', fontWeight: '900', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.5s' }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} color="var(--color-primary)" /> : <AlertCircle size={20} color="#ef4444" />}
          {toast.message}
        </div>,
        document.body
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default AdminStudents;
