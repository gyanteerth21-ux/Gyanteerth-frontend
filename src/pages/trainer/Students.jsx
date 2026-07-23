import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../shared/AuthContext';
import { 
  Search, Mail, BookOpen, TrendingUp, Filter, Users, Loader2, 
  ChevronDown, Upload, X, AlertCircle, Database, CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API, TRAINER_API, USER_API } from '../../config';


const BulkImportModal = ({ onClose, onImport, loading }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [vibrate, setVibrate] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ width: 'min(95vw, 500px)', backgroundColor: 'var(--color-surface)', borderRadius: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text)' }}>Bulk Import Students</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>Add multiple students to your registry via Excel.</p>
          </div>
          <button onClick={onClose} style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>
        </div>

        <div 
          style={{ 
            width: '100%', border: `2px dashed ${error ? '#ef4444' : 'var(--color-text-light)'}`, borderRadius: '1.5rem', padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--color-bg)', cursor: 'pointer', marginBottom: '1.5rem', position: 'relative', transition: 'all 0.2s'
          }}
        >
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          <Upload size={32} color={error ? '#ef4444' : '#6366f1'} style={{ marginBottom: '1rem' }} />
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: error ? '#ef4444' : 'var(--color-text)' }}>{file ? file.name : 'Click or drop Excel file'}</p>
        </div>

        {error && <div style={{ marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><AlertCircle size={14}/> {error}</div>}

        <motion.button 
          animate={vibrate ? { x: [-10, 10, -10, 10, 0] } : {}}
          onClick={handleProcessFile}
          disabled={loading || !file}
          style={{ 
            width: '100%', padding: '1rem', borderRadius: '1rem', border: 'none', 
            backgroundColor: error ? '#ef4444' : 'var(--color-text)', color: 'var(--color-surface)', fontWeight: 900, 
            fontSize: '1rem', cursor: loading || !file ? 'not-allowed' : 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
          {loading ? 'Processing...' : 'Start Import'}
        </motion.button>
      </motion.div>
    </div>,
    document.body
  );
};

const TrainerStudents = () => {
  const { user, smartFetch, authFetch, cacheSyncToken } = useAuth();
  
  const [students, setStudents] = useState([]);
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
            <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: 'var(--color-border)', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ height: '16px', width: '60%', background: 'var(--color-border)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              <div style={{ height: '12px', width: '40%', background: 'var(--color-border)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}><div style={{ height: '16px', width: '80%', background: 'var(--color-border)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} /></div>
          <div style={{ flex: 1 }}><div style={{ height: '24px', width: '100%', background: 'var(--color-border)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} /></div>
          <div style={{ flex: 0.5, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.85rem', background: 'var(--color-border)', animation: 'pulse 1.5s infinite ease-in-out' }} />
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
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const fetchStudents = useCallback(async () => {
    const identifier = user?.user_id || user?.id || user?.email;
    if (!identifier) return;
    setLoading(true);
    try {
      const [colData, branchData] = await Promise.all([
        smartFetch(`${USER_API}/colleges`, { cacheKey: 'all_colleges' }).catch(() => null),
        smartFetch(`${USER_API}/branches`, { cacheKey: 'all_branches' }).catch(() => null)
      ]);
      
      let colMap = {};
      if (colData && colData.data) {
        (colData.data || []).forEach(c => colMap[c.College_ID] = c.College_Name);
      }
      
      let branchMap = {};
      if (branchData && branchData.data) {
        (branchData.data || []).forEach(b => branchMap[b.branch_id] = b.branch_name);
      }

      const data = await smartFetch(`${TRAINER_API}/trainer_course_ids`, { cacheKey: `trainer_course_ids_${identifier}`, forceRefresh: true });
      const ids = data?.course_ids || [];
      const fetchPromises = ids.map(async (id) => {
        const [cData, pData] = await Promise.all([
          smartFetch(`${ADMIN_API}/course/${id}/full-details`, { cacheKey: `details_${id}` }),
          smartFetch(`${TRAINER_API}/course/${id}/students-progress`, { cacheKey: `st_prog_${id}`, forceRefresh: true })
        ]);
        let courseTitle = (cData?.course?.course_title || cData?.course?.title || `Course ID: ${id}`);
        let courseStudents = [];
        if (pData && pData.data) {
          courseStudents = (pData.data || []).map((st, index) => ({
            id: `${id}-${st.user_id || index}`,
            course_id: id,
            course_title: courseTitle,
            email: st.email || st.user_id,
            name: st.user_name || 'Anonymous Student',
            progress: st.progress_percentage || 0,
            completed_modules: st.completed_modules,
            total_modules: st.total_modules,
            college: colMap[st.user_college] || st.user_college || '',
            branch: branchMap[st.user_branch] || st.user_branch || '',
            year: st.user_year || ''
          }));
        }
        return { courseId: id, courseTitle, students: courseStudents };
      });
      const results = await Promise.all(fetchPromises);
      const allEnrollments = results.flatMap(r => r.students);
      const coursesList = results.filter(r => r.students.length > 0).map(r => ({ id: r.courseId, title: r.courseTitle }));
      setStudents(allEnrollments.sort((a, b) => b.progress - a.progress));
      setAvailableCourses(coursesList);
    } catch (err) {
      console.error("Sync failure", err);
    } finally {
      setLoading(false);
    }
  }, [user, smartFetch, cacheSyncToken]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleBulkImport = async (file) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authFetch(`${ADMIN_API}/bulk_create_users`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        showToast('Students imported successfully');
        setShowImportModal(false);
        fetchStudents();
      } else {
        const errorData = await response.json();
        showToast(errorData.detail || 'Unable to import data', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const uniqueColleges = useMemo(() => {
    const colleges = students.map(s => s.college).filter(Boolean);
    return ['All Colleges', ...Array.from(new Set(colleges))];
  }, [students]);

  const uniqueBranches = useMemo(() => {
    const branches = students.map(s => s.branch).filter(Boolean);
    return ['All Branches', ...Array.from(new Set(branches))];
  }, [students]);

  const uniqueYears = useMemo(() => {
    const years = students.map(s => s.year).filter(Boolean);
    return ['All Years', ...Array.from(new Set(years))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (st.name || '').toLowerCase().includes(q) || 
                            (st.email || '').toLowerCase().includes(q);
      const matchesCourse = courseFilter === 'All' || st.course_id === courseFilter;
      const matchesCollege = collegeFilter === 'All' || st.college === collegeFilter;
      const matchesBranch = branchFilter === 'All' || st.branch === branchFilter;
      const matchesYear = yearFilter === 'All' || st.year === yearFilter;
      let matchesProgress = true;
      if (progressFilter === 'Completed') matchesProgress = st.progress === 100;
      else if (progressFilter === 'InProgress') matchesProgress = st.progress > 0 && st.progress < 100;
      else if (progressFilter === 'NotStarted') matchesProgress = st.progress === 0;
      return matchesSearch && matchesCourse && matchesCollege && matchesBranch && matchesYear && matchesProgress;
    });
  }, [students, searchQuery, courseFilter, collegeFilter, branchFilter, yearFilter, progressFilter]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Student Roster</h1>
          <p style={{ margin: 0, maxWidth: '500px', fontSize: '1.05rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
             Manage and track the progress of all students enrolled in your knowledge nodes.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowImportModal(true)}
            style={{ 
              padding: '0.85rem 1.75rem', borderRadius: '1rem', 
              background: 'var(--color-text)', color: 'var(--color-surface)', border: 'none', 
              fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Upload size={18} /> Bulk Import
          </button>

          <div style={{ position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
               type="text" 
               placeholder="Search students..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ width: '220px', padding: '0.85rem 1rem 0.85rem 3rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.95rem', fontWeight: 600, outline: 'none', color: 'var(--color-text)' }} 
             />
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.85rem 2.5rem 0.85rem 1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Courses</option>
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              value={collegeFilter} 
              onChange={(e) => setCollegeFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.85rem 2.5rem 0.85rem 1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569', outline: 'none', cursor: 'pointer', maxWidth: '200px', textOverflow: 'ellipsis' }}
            >
              {uniqueColleges.map(c => (
                <option key={c} value={c === 'All Colleges' ? 'All' : c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              value={branchFilter} 
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.85rem 2.5rem 0.85rem 1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569', outline: 'none', cursor: 'pointer', maxWidth: '200px', textOverflow: 'ellipsis' }}
            >
              {uniqueBranches.map(b => (
                <option key={b} value={b === 'All Branches' ? 'All' : b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              value={yearFilter} 
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.85rem 2.5rem 0.85rem 1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569', outline: 'none', cursor: 'pointer', minWidth: '130px' }}
            >
              {uniqueYears.map(y => (
                <option key={y} value={y === 'All Years' ? 'All' : y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid #e2e8f0' }}>
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
                     <Users size={56} color="#cbd5e1" style={{ margin: '0 auto 1.5rem auto' }} />
                     <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>No students found.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredStudents.map((st, i) => (
                    <motion.tr 
                      key={st.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}
                      style={{ borderBottom: i === filteredStudents.length - 1 ? 'none' : '1px solid #f1f5f9' }}
                    >
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                            {(st.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>{st.name || st.username}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              <Mail size={12} /> {st.email}
                            </div>
                            {(st.college || st.branch || st.year) && (
                              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <GraduationCap size={12} style={{ color: '#6366f1' }} />
                                <span>{[st.college, st.branch, st.year].filter(Boolean).join(' • ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 700 }}>
                          <BookOpen size={16} color="#10b981" /> {st.course_title}
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ width: '100%', maxWidth: '200px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                             <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                             <span style={{ color: st.progress === 100 ? '#10b981' : '#4f46e5' }}>{st.progress || 0}%</span>
                           </div>
                           <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '1rem', overflow: 'hidden' }}>
                             <motion.div initial={{ width: 0 }} animate={{ width: `${st.progress || 0}%` }} transition={{ duration: 1 }} style={{ width: `${st.progress || 0}%`, height: '100%', backgroundColor: st.progress === 100 ? '#10b981' : '#4f46e5' }} />
                           </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                           <button onClick={() => window.location.href = `mailto:${st.email}`} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--color-surface)', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <Mail size={16} color="#64748b" />
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

      {showImportModal && <BulkImportModal onClose={() => setShowImportModal(false)} onImport={handleBulkImport} loading={actionLoading} />}

      {toast && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, padding: '1rem 2.5rem', borderRadius: '4rem', backgroundColor: toast.type === 'success' ? 'var(--color-text)' : '#ef4444', color: 'var(--color-surface)', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} color="#10b981" /> : <AlertCircle size={20} color="var(--color-surface)" />}
          {toast.message}
        </motion.div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default TrainerStudents;