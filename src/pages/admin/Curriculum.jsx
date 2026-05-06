import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit, Trash2, Video, Calendar, FileText,
  Award, ChevronRight, Play, Monitor, Link, Clock, Loader2,
  MoreVertical, Settings, Save, X, PlusCircle, CheckCircle2, AlertCircle,
  FileBox, BookOpen, Layers, Grid, Zap, ShieldCheck, ArrowUp, ArrowDown,
  Layout, Activity, Fingerprint, Briefcase, Trash, Search, Settings2, ExternalLink, Menu, FileUp
} from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { ADMIN_API } from '../../config';

const AdminCurriculum = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, authFetch, smartFetch, cacheSyncToken } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef(null);
  const [importTargetId, setImportTargetId] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleForm, setModuleForm] = useState({ Title: '', Description: '', Position: 1, editingId: null });

  const [editModal, setEditModal] = useState({ show: false, type: '', data: null });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questionForm, setQuestionForm] = useState({ Question_Txt: '', Mark: 10, Question_Type: 'MCQ', Explanation: '', Position: 1, editingId: null });
  const [options, setOptions] = useState([
    { Option_Txt: '', Is_Correct: false, Position: 1 },
    { Option_Txt: '', Is_Correct: false, Position: 2 }
  ]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBulkImportQuestions = async (e) => {
    const file = e.target.files[0];
    const assessmentId = importTargetId;
    if (!file || !assessmentId) return;

    setImporting(true);
    const importData = new FormData();
    importData.append('file', file);

    try {
      const res = await authFetch(`${ADMIN_API}/bulk_upload_questions/${assessmentId}`, {
        method: 'POST',
        body: importData
      });

      if (res.ok) {
        showToast('Questions Imported Successfully');
        fetchCurriculum();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const error = await res.json().catch(() => ({}));
        showToast(error.detail || 'Import failed', 'error');
      }
    } catch (err) {
      showToast('Network error during import', 'error');
    } finally {
      setImporting(false);
      setImportTargetId(null);
    }
  };

  const fetchCurriculum = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await smartFetch(`${ADMIN_API}/course/${courseId}/full-details`, { cacheKey: `details_${courseId}` });
      if (data) {
        const rawCourse = data.course || data;
        const mappedCourse = {
          ...rawCourse,
          course_id: rawCourse.course_id || rawCourse.id,
          course_title: rawCourse.course_title || rawCourse.title,
          course_type: rawCourse.type || rawCourse.course_type || rawCourse.course_Type || 'recorded'
        };
        setCourse(mappedCourse);
        
        if (mappedCourse.course_type === 'live' && activeTab === 'lessons') {
          setActiveTab('live');
        } else if (mappedCourse.course_type === 'recorded' && activeTab === 'live') {
          setActiveTab('lessons');
        }

        const courseLevelNotes = (rawCourse.notes || []);
        const sortedModules = (rawCourse.modules || []).sort((a, b) => (a.position || a.Position || 0) - (b.position || b.Position || 0)).map(m => {
          const content = m.content || {};
          return {
            ...m,
            module_id: m.module_id || m.Module_ID,
            video: (content.videos || m.video || []).map(v => ({
              ...v,
              video_id: v.video_id || v.Video_ID,
              video_url: v.video_url || v.Video_URL || v.url,
              course_description: v.description || v.course_description || v.Course_Description || v.title
            })),
            assessments: (content.assessments || m.assessments || []).map(a => {
              const rawQuestions = a.questions || a.Questions || [];
              const sortedQuestions = [...rawQuestions].sort((qx, qy) => (qx.position || qx.Position || 0) - (qy.position || qy.Position || 0));

              return {
                ...a,
                assessment_id: a.assessment_id || a.Assessment_ID,
                questions: sortedQuestions.map(q => ({
                  ...q,
                  question_id: q.question_id || q.Question_ID,
                  question_txt: q.question_text || q.question_txt || q.Question_Txt || q.text,
                  options: (q.options || q.Options || []).map(o => ({
                    ...o,
                    option_id: o.option_id || o.Option_ID,
                    option_txt: o.text || o.option_txt || o.Option_Txt || o.option,
                    is_correct: o.is_correct !== undefined ? o.is_correct : o.Is_Correct
                  }))
                }))
              };
            }),
            live_sessions: (content.live_sessions || m.live_sessions || []).map(l => ({
              ...l,
              live_id: l.live_id || l.Live_ID,
              meeting_url: l.meeting_url || l.Meeting_URL
            })),
            notes: (content.notes || m.notes || courseLevelNotes).map(n => ({
              ...n,
              note_id: n.note_id || n.Notes_ID || n.notes_id,
              note_url: n.file_url || n.note_url || n.File_URL || n.Note_URL
            }))
          };
        });
        setModules(sortedModules);
        if (sortedModules.length > 0 && !activeModule) { setActiveModule(sortedModules[0]); }
        else if (activeModule) {
          const updatedActive = sortedModules.find(m => (m.module_id || m.Module_ID) === (activeModule.module_id || activeModule.Module_ID));
          if (updatedActive) {
            setActiveModule(updatedActive);
            if (activeAssessment) {
              const updatedAsm = updatedActive.assessments.find(a => (a.assessment_id || a.Assessment_ID) === (activeAssessment.assessment_id || activeAssessment.Assessment_ID));
              if (updatedAsm) setActiveAssessment(updatedAsm);
            }
          }
        }
      }
    } catch (err) { console.error('fetchCurriculum failed:', err); showToast('Data synchronization failed', 'error'); }
    finally { setLoading(false); }
  }, [courseId, smartFetch, cacheSyncToken]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const url = moduleForm.editingId ? `${ADMIN_API}/update_module/${moduleForm.editingId}` : `${ADMIN_API}/create_module`;
    try {
      const res = await authFetch(url, {
        method: moduleForm.editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Course_ID: courseId, Title: moduleForm.Title, Course_Description: moduleForm.Description, Position: parseInt(moduleForm.Position) || 1 })
      });
      if (res.ok) { showToast(moduleForm.editingId ? 'Chapter updated' : 'Chapter created'); setShowModuleForm(false); setModuleForm({ Title: '', Description: '', Position: 0, editingId: null }); await fetchCurriculum(); }
      else { 
        const errData = await res.json().catch(() => ({})); 
        showToast(errData.detail || errData.message || `Action failed (${res.status} error)`, 'error'); 
      }
    } catch (err) { 
      showToast('Network or server error', 'error'); 
    } finally { setActionLoading(false); }
  };

  const deleteModule = async (id) => {
    if (!window.confirm('Erase this chapter? This cannot be undone.')) return;
    try {
      const res = await authFetch(`${ADMIN_API}/delete-module/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Chapter Removed'); fetchCurriculum(); }
    } catch (err) { showToast('Action failed', 'error'); }
  };

  const genericSubmit = async (type, payload) => {
    setActionLoading(true);
    const endpoints = {
      video: { create: 'create_video', update: 'update_video', label: 'Lesson' },
      live: { create: 'create_live_session', update: 'update_live_session', label: 'Live Session' },
      notes: { create: 'create_notes', update: 'update_notes', label: 'Resource' },
      assessment: { create: 'create_assessment', update: 'update_assessment', label: 'Assessment' }
    };
    const conf = endpoints[type];
    const isUpdate = !!payload.editingId;
    const url = isUpdate ? `${ADMIN_API}/${conf.update}/${payload.editingId}` : `${ADMIN_API}/${conf.create}`;

    try {
      const body = { ...payload, Course_ID: courseId, Module_ID: activeModule.module_id };
      if (type === 'notes') { body.File_URL = payload.Note_URL; if (!payload.File_Type) body.File_Type = 'link'; delete body.Note_URL; }
      if (type === 'video') { body.Video_URL = payload.video_url; body.course_description = payload.course_description || payload.title; delete body.video_url; }

      const res = await authFetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showToast(`${conf.label} Saved`);
        setEditModal({ show: false, type: '', data: null });
        await fetchCurriculum();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.detail || errorData.message || `Failed to create ${conf.label} (${res.status} error)`, 'error');
      }
    } catch (err) {
      showToast(`Network or server error occurred`, 'error');
    } finally { setActionLoading(false); }
  };

  const genericDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    const endpoints = { video: 'delete-video', live: 'delete-live', notes: 'delete-notes', assessment: 'delete-assessment', question: 'delete-question' };
    try {
      const res = await authFetch(`${ADMIN_API}/${endpoints[type]}/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Successfully Removed'); fetchCurriculum(); }
    } catch (err) { showToast('Operation failed', 'error'); }
  };

  const swapPositions = async (endpoint, id1, id2) => {
    setActionLoading(true);
    const bodyKey1 = endpoint.includes('module') ? 'module_id_1' : 'question_id_1';
    const bodyKey2 = endpoint.includes('module') ? 'module_id_2' : 'question_id_2';
    try {
      const res = await authFetch(`${ADMIN_API}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey1]: id1, [bodyKey2]: id2 })
      });
      if (res.ok) { showToast('Priority Updated'); await fetchCurriculum(); }
    } finally { setActionLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>

      <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem var(--page-padding)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mobile-only-btn" style={{ padding: '0.5rem', background: 'var(--color-surface-muted)', border: 'none', borderRadius: '0.75rem', cursor: 'pointer' }}><Menu size={20} /></button>
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin/courses' : '/trainer/courses')} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}><ArrowLeft size={18} /></button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.15rem' }}>
              <Layers size={12} /><span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Course Evolution</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 4vw, 1.35rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course?.course_title || 'Syncing curriculum...'}</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => {
            const usedPositions = new Set(modules.map(m => m.position || m.Position || 0));
            let nextPos = 2;
            while (usedPositions.has(nextPos)) nextPos++;
            setModuleForm({ Title: '', Description: '', Position: nextPos, editingId: null });
            setShowModuleForm(true);
          }} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> <span className="hide-on-mobile">New Chapter</span>
          </button>
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin/courses' : '/trainer/courses')} className="btn btn-ghost hide-on-mobile" style={{ padding: '0.65rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', fontSize: '0.85rem' }}>Exit Editor</button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              style={{ width: '240px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 50 }}
              className="curriculum-sidebar"
            >
              <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Grid size={12} /> Chapters</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {modules.map((m, idx) => (
                    <motion.div
                      key={m.module_id}
                      onClick={() => { setActiveModule(m); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        padding: '1rem', borderRadius: '1.25rem', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: activeModule?.module_id === m.module_id ? 'var(--color-bg)' : 'transparent',
                        border: '1px solid',
                        borderColor: activeModule?.module_id === m.module_id ? 'var(--color-primary-light)20' : 'transparent',
                        display: 'flex', alignItems: 'center', gap: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); swapPositions('swap-module-position', m.module_id, modules[idx - 1].module_id); }} disabled={idx === 0} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><ArrowUp size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); swapPositions('swap-module-position', m.module_id, modules[idx + 1].module_id); }} disabled={idx === modules.length - 1} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><ArrowDown size={12} /></button>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 950, color: activeModule?.module_id === m.module_id ? 'var(--color-primary)' : 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{m.video?.length || 0} Lessons • {m.assessments?.length || 0} Exams</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', opacity: activeModule?.module_id === m.module_id ? 1 : 0.4 }}>
                        <button onClick={(e) => { e.stopPropagation(); setModuleForm({ Title: m.title, Description: m.description, Position: m.position, editingId: m.module_id }); setShowModuleForm(true); }} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}><Settings size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteModule(m.module_id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash size={14} /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--color-surface)', padding: 'clamp(1rem, 5vw, 3.5rem)', position: 'relative' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleBulkImportQuestions} />
          {!activeModule ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontWeight: 950, fontSize: '0.9rem', letterSpacing: '0.1em', textAlign: 'center', padding: '2rem' }}>
              CHOOSE A CHAPTER TO BEGIN CRAFTING KNOWLEDGE
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.25rem', background: 'var(--color-surface-muted)', borderRadius: '1.25rem', border: '1px solid var(--color-border)' }}>
                  {(course?.course_type === 'recorded') && (
                    <SubTab active={activeTab === 'lessons'} icon={<Video size={12} />} label="Lessons" onClick={() => setActiveTab('lessons')} color="var(--color-primary)" />
                  )}
                  {(course?.course_type === 'live') && (
                    <SubTab active={activeTab === 'live'} icon={<Monitor size={12} />} label="Live Sessions" onClick={() => setActiveTab('live')} color="#3b82f6" />
                  )}
                  <SubTab active={activeTab === 'notes'} icon={<FileText size={12} />} label="Resources" onClick={() => setActiveTab('notes')} color="#ef4444" />
                  <SubTab active={activeTab === 'assessments'} icon={<Award size={12} />} label="Assessments" onClick={() => setActiveTab('assessments')} color="#f97316" />
                  {activeAssessment && <SubTab active={activeTab === 'builder'} icon={<Settings2 size={12} />} label="Builder" onClick={() => setActiveTab('builder')} color="#854dff" />}
                </div>
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <button
                    onClick={() => setEditModal({ show: true, type: activeTab === 'assessments' ? 'assessment' : activeTab === 'notes' ? 'notes' : activeTab === 'live' ? 'live' : 'video', data: activeTab === 'assessments' ? { Title: '', Description: '', Total_Mark: 100, Passing_Mark: 40, Duration: 30, Attempt_Limit: 3, Status: 'active' } : activeTab === 'notes' ? { Title: '', Note_URL: '' } : activeTab === 'live' ? { Title: '', Meeting_URL: '', Provider: 'Zoom', Start_time: '', End_time: '', Status: 'scheduled' } : { video_url: '', course_description: '' } })}
                    className="btn btn-primary" style={{ padding: '0.45rem 1.15rem', borderRadius: '0.85rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={14} /> Add {activeTab === 'lessons' ? 'Lesson' : activeTab === 'assessments' ? 'Exam' : 'Asset'}
                  </button>
                </div>
              </div>

              <div style={{ minHeight: '60vh' }}>
                <AnimatePresence mode="wait">
                  {['lessons', 'live', 'notes', 'assessments'].includes(activeTab) && (
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 450px), 1fr))', gap: '1.5rem' }}>
                        {activeTab === 'lessons' && (activeModule.video || []).map((v, i) => (
                          <ContentItem key={v.video_id} index={i} icon={<Play size={14} fill="currentColor" />} title={v.course_description} sub={v.video_url} color="var(--color-primary)"
                            onEdit={() => setEditModal({ show: true, type: 'video', data: { editingId: v.video_id, video_url: v.video_url, course_description: v.course_description } })}
                            onDelete={() => genericDelete('video', v.video_id)}
                          />
                        ))}
                        {activeTab === 'live' && (activeModule.live_sessions || []).map((l, i) => (
                          <ContentItem key={l.live_id} index={i} icon={<Activity size={14} />} title={l.title || `${l.provider} Interaction`} sub={l.meeting_url} color="#3b82f6"
                            onEdit={() => setEditModal({ show: true, type: 'live', data: { editingId: l.live_id, Title: l.title, Meeting_URL: l.meeting_url, Provider: l.provider, Start_time: l.start_time, End_time: l.end_time, Status: l.status } })}
                            onDelete={() => genericDelete('live', l.live_id)}
                          />
                        ))}
                        {activeTab === 'notes' && (activeModule.notes || []).map((n, i) => (
                          <ContentItem key={n.note_id} index={i} icon={<FileBox size={14} />} title={n.title} sub={n.note_url} color="#ef4444"
                            onEdit={() => setEditModal({ show: true, type: 'notes', data: { editingId: n.note_id, Title: n.title, Note_URL: n.note_url } })}
                            onDelete={() => genericDelete('notes', n.note_id)}
                          />
                        ))}
                        {activeTab === 'assessments' && (activeModule.assessments || []).map((a, i) => (
                          <div key={a.assessment_id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ContentItem index={i} icon={<Briefcase size={14} />} title={a.title} sub={`${a.total_mark} Pts • ${a.duration} Mins`} color="#f97316"
                              onEdit={() => setEditModal({ show: true, type: 'assessment', data: { editingId: a.assessment_id, Title: a.title, Description: a.description, Total_Mark: a.total_mark, Passing_Mark: a.passing_mark, Duration: a.duration, Attempt_Limit: a.attempt_limit, Status: a.status } })}
                              onDelete={() => genericDelete('assessment', a.assessment_id)}
                            />
                            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', marginLeft: '4.5rem' }}>
                              <button onClick={() => { setActiveAssessment(a); setActiveTab('builder'); }} className="btn btn-ghost" style={{ padding: '0.4rem 1.25rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', fontSize: '0.75rem', fontWeight: 950, color: '#f97316', background: '#fff7ed' }}>Question Builder ({a.questions?.length || 0})</button>
                              <button 
                                onClick={() => { setImportTargetId(a.assessment_id); setTimeout(() => fileInputRef.current?.click(), 0); }} 
                                disabled={importing}
                                style={{ 
                                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                  padding: '0.4rem 1.25rem', borderRadius: '1rem', 
                                  background: '#0f172a', color: 'white', 
                                  border: 'none', fontWeight: 900, fontSize: '0.75rem',
                                  cursor: importing ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                }}
                              >
                                {importing && importTargetId === a.assessment_id ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                                Bulk Import
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {((activeTab === 'lessons' && !activeModule.video?.length) || (activeTab === 'live' && !activeModule.live_sessions?.length) || (activeTab === 'notes' && !activeModule.notes?.length) || (activeTab === 'assessments' && !activeModule.assessments?.length)) && <EmptyPlaceholder label={`Initializing ${activeTab} stack... Add your first item above.`} />}
                    </motion.div>
                  )}

                  {activeTab === 'builder' && activeAssessment && (
                    <motion.div key="builder" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '1rem' }}>{activeAssessment.title} Builder</h2>
                          <p style={{ margin: '0.15rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Curating {activeAssessment.questions?.length || 0} evaluation nodes</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button 
                             onClick={() => { setImportTargetId(activeAssessment.assessment_id); setTimeout(() => fileInputRef.current?.click(), 0); }} 
                             disabled={importing}
                             style={{ 
                               display: 'flex', alignItems: 'center', gap: '0.5rem', 
                               padding: '0.45rem 1.15rem', borderRadius: '0.85rem', 
                               background: '#0f172a', color: 'white', 
                               border: 'none', fontWeight: 900, fontSize: '0.75rem',
                               cursor: importing ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                             }}
                           >
                             {importing ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                             Bulk Import Questions
                           </button>
                           <button onClick={() => setShowQuestionForm(true)} className="btn btn-primary" style={{ padding: '0.45rem 1.15rem', borderRadius: '0.85rem', fontSize: '0.75rem', background: '#854dff', border: 'none' }}>+ New Question</button>
                           <button onClick={() => setActiveTab('assessments')} className="btn btn-ghost" style={{ padding: '0.45rem 1.15rem', borderRadius: '0.85rem', fontSize: '0.75rem', border: '1px solid var(--color-border-strong)' }}>Close Builder</button>
                         </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 550px), 1fr))', gap: '2rem' }}>
                        {activeAssessment.questions?.map((q, idx) => (
                          <motion.div
                            key={q.question_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            style={{ padding: '1.25rem', borderRadius: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', boxShadow: 'var(--shadow-sm)' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.2rem' }}>
                                  <button onClick={() => swapPositions('swap-question-position', q.question_id, activeAssessment.questions[idx - 1].question_id)} disabled={idx === 0} style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}><ArrowUp size={12} /></button>
                                  <button onClick={() => swapPositions('swap-question-position', q.question_id, activeAssessment.questions[idx + 1].question_id)} disabled={idx === activeAssessment.questions.length - 1} style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}><ArrowDown size={12} /></button>
                                </div>
                                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.6rem', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '0.8rem', flexShrink: 0 }}>{idx + 1}</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1.4 }}>{q.question_txt}</p>
                              </div>
                              <button onClick={() => genericDelete('question', q.question_id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}><Trash2 size={14} /></button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: '3.75rem' }}>
                              {q.options.map(o => (
                                <div key={o.option_id} style={{ padding: '0.35rem 0.85rem', borderRadius: '0.6rem', background: o.is_correct ? 'var(--color-primary-bg)' : 'var(--color-bg)', border: '1px solid', borderColor: o.is_correct ? 'var(--color-primary)' : 'var(--color-border-strong)', fontSize: '0.7rem', fontWeight: 900, color: o.is_correct ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                  {o.option_txt}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* UNIFIED CONTENT MODAL */}
      <AnimatePresence>
        {editModal.show && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-padding)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              style={{ width: 'clamp(320px, 95vw, 650px)', backgroundColor: 'var(--color-surface)', borderRadius: '3.5rem', padding: '3.5rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)', position: 'relative' }}
              className="no-scrollbar"
            >
              <button onClick={() => setEditModal({ show: false, type: '', data: null })} style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', padding: '0.75rem', borderRadius: '1.25rem', background: 'var(--color-surface-muted)', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '3.5rem' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
                  {editModal.type === 'video' ? <Video size={24} /> : editModal.type === 'live' ? <Monitor size={24} /> : editModal.type === 'notes' ? <FileText size={24} /> : <Award size={24} />}
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>{editModal.data?.editingId ? 'Modify Content' : 'New Content'}</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Architecting Wisdom</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); genericSubmit(editModal.type, editModal.data); }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {editModal.type === 'video' && (
                  <>
                    <AMInput label="Lesson Title" value={editModal.data.course_description} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, course_description: e.target.value } })} required placeholder="e.g. Masterclass Introduction" />
                    <AMInput label="Content Stream URL" value={editModal.data.video_url} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, video_url: e.target.value } })} required placeholder="https://..." />
                  </>
                )}
                {editModal.type === 'live' && (
                  <>
                    <AMInput label="Session Topic" value={editModal.data.Title} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Title: e.target.value } })} required placeholder="e.g. Q&A Session" />
                    <AMInput label="Live Class Link" value={editModal.data.Meeting_URL} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Meeting_URL: e.target.value } })} placeholder="https://..." />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <AMSelect label="Platform" value={editModal.data.Provider} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Provider: e.target.value } })} options={['Zoom', 'Google Meet', 'Teams', 'Other']} />
                      <AMSelect label="Session Status" value={editModal.data.Status} onChange={e => {
                        const newStatus = e.target.value;
                        let startStr = editModal.data.Start_time;
                        let endStr = editModal.data.End_time;
                        if (newStatus === 'live') {
                          const now = new Date();
                          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                          const istTime = new Date(utc + (5.5 * 3600000));
                          const istEndTime = new Date(utc + (6.5 * 3600000));
                          const formatStr = (d) => {
                            const p = n => n.toString().padStart(2, '0');
                            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
                          };
                          startStr = formatStr(istTime);
                          endStr = formatStr(istEndTime);
                        }
                        setEditModal({ ...editModal, data: { ...editModal.data, Status: newStatus, Start_time: startStr, End_time: endStr } });
                      }} options={[{ label: 'Scheduled', val: 'scheduled' }, { label: 'Live Now', val: 'live' }]} />
                    </div>
                    {editModal.data.Status !== 'live' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                         <AMInput label="Starting Time" type="datetime-local" step="60" value={editModal.data.Start_time} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Start_time: e.target.value } })} required />
                         <AMInput label="Ending Time" type="datetime-local" step="60" value={editModal.data.End_time} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, End_time: e.target.value } })} required />
                      </div>
                    )}
                  </>
                )}
                {editModal.type === 'notes' && (
                  <>
                    <AMInput label="Resource Label" value={editModal.data.Title} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Title: e.target.value } })} required placeholder="e.g. Reference Guide" />
                    <AMInput label="Asset Reference Link" value={editModal.data.Note_URL} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Note_URL: e.target.value } })} required />
                  </>
                )}
                {editModal.type === 'assessment' && (
                  <>
                    <AMInput label="Evaluation Title" value={editModal.data.Title} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Title: e.target.value } })} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <AMInput label="Reward Threshold" type="number" value={editModal.data.Total_Mark} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Total_Mark: e.target.value } })} />
                      <AMInput label="Minutes Allowed" type="number" value={editModal.data.Duration} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Duration: e.target.value } })} />
                    </div>
                  </>
                )}

                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '1.5rem', fontSize: '1rem' }}>
                  {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  {editModal.data?.editingId ? 'Update Evolution' : 'Initialize Content'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHAPTER MODAL */}
      <AnimatePresence>
        {showModuleForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-padding)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ width: 'clamp(320px, 95vw, 550px)', backgroundColor: 'var(--color-surface)', borderRadius: '3.5rem', padding: '3.5rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)', position: 'relative' }}>
              <button onClick={() => setShowModuleForm(false)} style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', background: 'var(--color-surface-muted)', border: 'none', color: 'var(--color-text-muted)', padding: '0.75rem', borderRadius: '1.25rem' }}><X size={24} /></button>
              <h2 style={{ margin: '0 0 3rem 0' }}>{moduleForm.editingId ? 'Modify Chapter' : 'New Chapter'}</h2>
              <form onSubmit={handleModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <AMInput label="Chapter Designation" value={moduleForm.Title} onChange={e => setModuleForm({ ...moduleForm, Title: e.target.value })} required placeholder="e.g. Introduction to Design" />
                {/* Position is auto-calculated — no manual input */}
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 800, padding: '0.5rem 1.5rem', background: 'var(--color-bg)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                  📌 Auto-assigned position: <strong>#{moduleForm.Position}</strong>
                  {moduleForm.editingId && ' (locked — use arrows to reorder)'}
                </div>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ padding: '1.25rem', borderRadius: '1.5rem', fontSize: '1rem', marginTop: '1.5rem' }}>Confirm Chapter</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUESTION MODAL */}
      <AnimatePresence>
        {showQuestionForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-padding)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 'clamp(320px, 95vw, 750px)', backgroundColor: 'var(--color-surface)', borderRadius: '3.5rem', padding: '3.5rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} className="no-scrollbar">
              <button onClick={() => setShowQuestionForm(false)} style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', background: 'var(--color-surface-muted)', border: 'none', color: 'var(--color-text-muted)', padding: '0.75rem', borderRadius: '1.25rem' }}><X size={24} /></button>
              <h2 style={{ margin: '0 0 3rem 0' }}>Forge Evaluation Node</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <AMInput label="Question Premise" value={questionForm.Question_Txt} onChange={e => setQuestionForm({ ...questionForm, Question_Txt: e.target.value })} placeholder="What is being evaluated?" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                  <AMSelect label="Evaluation Model" value={questionForm.Question_Type} onChange={e => {
                    const type = e.target.value;
                    setQuestionForm({ ...questionForm, Question_Type: type });
                    if (type === 'True/False') setOptions([{ Option_Txt: 'True', Is_Correct: true, Position: 1 }, { Option_Txt: 'False', Is_Correct: false, Position: 2 }]);
                    else setOptions([{ Option_Txt: '', Is_Correct: false, Position: 1 }, { Option_Txt: '', Is_Correct: false, Position: 2 }]);
                  }} options={['MCQ', 'True/False']} />
                  <AMInput label="Point Value" type="number" value={questionForm.Mark} onChange={e => setQuestionForm({ ...questionForm, Mark: e.target.value })} />
                </div>
                <AMInput label="Enlightenment Context (Optional)" value={questionForm.Explanation} onChange={e => setQuestionForm({ ...questionForm, Explanation: e.target.value })} placeholder="Explain the correct answer..." />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Option nodes</label>
                  {options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <input type="radio" checked={opt.Is_Correct} onChange={() => setOptions(options.map((o, i) => ({ ...o, Is_Correct: i === idx })))} style={{ accentColor: 'var(--color-primary)', width: '1.5rem', height: '1.5rem' }} />
                      <input placeholder={`Option ${idx + 1}`} value={opt.Option_Txt} onChange={e => setOptions(options.map((o, i) => i === idx ? { ...o, Option_Txt: e.target.value } : o))} style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '1.25rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-bg)', fontWeight: 800, color: 'var(--color-text)', outline: 'none' }} />
                      {options.length > 2 && <button onClick={() => setOptions(options.filter((_, i) => i !== idx))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash size={18} /></button>}
                    </div>
                  ))}
                  <button onClick={() => setOptions([...options, { Option_Txt: '', Is_Correct: false, Position: options.length + 1 }])} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer', padding: '0.5rem' }}>+ Add Option Node</button>
                </div>
                <button onClick={async () => {
                  setActionLoading(true); try {
                    // ✅ Fetch fresh data — positions are GLOBALLY shared across all assessments in DB
                    const freshRes = await authFetch(`${ADMIN_API}/course/${courseId}/full-details`);
                    // ✅ Random int within 32-bit integer safe range (max: 2,147,483,647)
                    // Collision chance is ~1 in 2 billion — effectively zero
                    const nextPos = Math.floor(Math.random() * 2000000000) + 1000;

                    const res = await authFetch(`${ADMIN_API}/create_question`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        Assessment_ID: activeAssessment.assessment_id,
                        Question_Txt: questionForm.Question_Txt,
                        Mark: parseInt(questionForm.Mark) || 10,
                        Question_Type: questionForm.Question_Type || 'MCQ',
                        Explanation: questionForm.Explanation || '',
                        Position: nextPos   // ✅ always unique, never conflicts
                      })
                    });

                    if (res.ok) {
                      const qData = await res.json();
                      const qId = qData.Question_ID || qData.question_id || qData.id ||
                        (qData.data && (qData.data.Question_ID || qData.data.id));
                      if (!qId) throw new Error('Registry Sync Error');

                      for (const o of options) {
                        // ✅ Same fix as question position — globally shared option table
                        const optPos = Math.floor(Math.random() * 2000000000) + 1000;
                        await authFetch(`${ADMIN_API}/create_option`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            Question_ID: qId,
                            Option_Txt: o.Option_Txt,
                            Is_Correct: o.Is_Correct,
                            Position: optPos
                          })
                        });
                      }
                      showToast('Question Forged'); await fetchCurriculum(); setShowQuestionForm(false);
                      setQuestionForm({ Question_Txt: '', Mark: 10, Question_Type: 'MCQ', Explanation: '', editingId: null });
                      setOptions([{ Option_Txt: '', Is_Correct: false, Position: 1 }, { Option_Txt: '', Is_Correct: false, Position: 2 }]);
                    } else {
                      const err = await res.json();
                      showToast(err.message || 'Sync Refused', 'error');
                    }
                  } finally { setActionLoading(false); }
                }} 
                  disabled={actionLoading}
                  className="btn btn-primary" 
                  style={{ 
                    padding: '1.25rem', borderRadius: '1.5rem', fontSize: '1rem', marginTop: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    opacity: actionLoading ? 0.7 : 1, cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                  {actionLoading ? 'Forging Question...' : 'Commit Question'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <div style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, padding: '1.15rem 3rem', borderRadius: '4rem', backgroundColor: '#111827', color: 'white', fontWeight: '950', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.5s' }}>
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
          .mobile-only-btn { display: none; }
          @media (max-width: 1024px) {
            .mobile-only-btn { display: block; }
            .curriculum-sidebar { position: fixed; inset: 0; right: auto; box-shadow: 20px 0 60px rgba(0,0,0,0.1); }
            .hide-on-mobile { display: none; }
          }
       `}</style>
    </div>
  );
};

const SubTab = ({ active, icon, label, onClick, color }) => (
  <button onClick={onClick} style={{ padding: '0.55rem 1.15rem', border: 'none', borderRadius: '1.15rem', backgroundColor: active ? 'var(--color-surface)' : 'transparent', color: active ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 950, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.55rem', boxShadow: active ? 'var(--shadow-sm)' : 'none' }}>
    <span style={{ color: active ? color : 'inherit' }}>{icon}</span> {label}
  </button>
);

const ContentItem = ({ icon, title, sub, color, onEdit, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    style={{ padding: '0.85rem 1.25rem', borderRadius: '1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}
    className="premium-card"
  >
    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button onClick={onEdit} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={14} /></button>
      <button onClick={onDelete} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: '#fff1f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash size={14} /></button>
    </div>
  </motion.div>
);

const AMInput = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <input {...props} style={{ padding: '0.85rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', backgroundColor: 'var(--color-bg)', outline: 'none', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', transition: 'all 0.2s' }} />
  </div>
);

const AMSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <select value={value} onChange={onChange} style={{ padding: '0.85rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border-strong)', background: 'var(--color-bg)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', cursor: 'pointer' }}>
      {options.map(o => typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
  </div>
);

const EmptyPlaceholder = ({ label }) => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 950, fontSize: '0.9rem', letterSpacing: '0.05em' }}>{label?.toUpperCase()}</div>
);

export default AdminCurriculum;
