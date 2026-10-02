import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, courseSchema, demoSchema, moduleSchema, lessonSchema, liveSessionSchema, recSessionSchema, notesSchema, assessmentSchema, questionSchema } from '../../shared/schemas';
import {
   X, XCircle, CheckCircle2, Loader2, ArrowRight, PlusCircle, Edit, Info, FolderPlus, Play, Trash2, Video, Layers, FileText, Clock, Link, Monitor, Film, Timer, HelpCircle, Award, Hash, Book, Globe, User, Users, Zap
} from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { BookOpen, ShieldCheck, Target, Calendar, BookOpen as BookIcon } from 'lucide-react';
import { ADMIN_API } from '../../config';
import { useConfirm } from '../shared/ConfirmProvider';

const Section = ({ title, children, icon: Icon }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1.5rem', border: '1px solid var(--color-border)' }}>
      <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
         {Icon && <Icon size={16} />} {title}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
         {children}
      </div>
   </div>
);

const FormInput = React.forwardRef(({ label, limit, error, ...props }, ref) => {
   const currentLength = props.value ? String(props.value).length : 0;
   const isExceeded = limit && currentLength > limit;
   const hasError = isExceeded || !!error;

   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
               {error && <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444' }}>{error.message}</span>}
               {limit && (
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: isExceeded ? '#ef4444' : 'var(--color-text-muted)' }}>
                     {isExceeded ? `Exceeded limit` : `${limit - currentLength} left`}
                  </span>
               )}
            </div>
         </div>
         <input {...props} ref={ref} style={{ backgroundColor: 'var(--color-surface)', border: `1px solid ${hasError ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '0.75rem', padding: '0.85rem 1rem', color: 'var(--color-text)', fontWeight: '600', outline: 'none', transition: 'all 0.2s', fontSize: '0.9rem' }} onFocus={(e) => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--color-primary)'; props.onFocus?.(e); }} onBlur={(e) => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--color-border)'; props.onBlur?.(e); }} />
      </div>
   );
});

const FormTextArea = React.forwardRef(({ label, limit, error, ...props }, ref) => {
   const currentLength = props.value ? String(props.value).length : 0;
   const isExceeded = limit && currentLength > limit;
   const hasError = isExceeded || !!error;

   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', gridColumn: '1 / -1' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
               {error && <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444' }}>{error.message}</span>}
               {limit && (
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: isExceeded ? '#ef4444' : 'var(--color-text-muted)' }}>
                     {isExceeded ? `Exceeded limit` : `${limit - currentLength} left`}
                  </span>
               )}
            </div>
         </div>
         <textarea {...props} ref={ref} style={{ backgroundColor: 'var(--color-surface)', border: `1px solid ${hasError ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '1rem', padding: '1rem', color: 'var(--color-text)', fontWeight: '600', outline: 'none', resize: 'none', minHeight: '80px', transition: 'all 0.2s', fontSize: '0.9rem' }} onFocus={(e) => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--color-primary)'; props.onFocus?.(e); }} onBlur={(e) => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--color-border)'; props.onBlur?.(e); }} />
      </div>
   );
});

const FormSelect = React.forwardRef(({ label, children, error, ...props }, ref) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>{label}</label>
         {error && <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444' }}>{error.message}</span>}
      </div>
      <select {...props} ref={ref} style={{ backgroundColor: 'var(--color-surface)', border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '0.75rem', padding: '0.85rem 1rem', color: 'var(--color-text)', fontWeight: '600', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
         {children}
      </select>
   </div>
));


export const ManageModuleModal = ({ course, onClose, showToast, refresh }) => {
  const confirm = useConfirm();
   const { authFetch } = useAuth();
   const [loading, setLoading] = useState(false);
   const [modules, setModules] = useState(course.modules || []);
   const [editingModule, setEditingModule] = useState(null);
   const [activeModuleId, setActiveModuleId] = useState(null);
   const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'live', or 'assessments'

   const [formData, setFormData] = useState({ Title: '', Course_Description: '', Position: modules.length + 1 });
   const [videoForm, setVideoForm] = useState({ Video_URL: '', course_description: '', editingId: null });
   const [liveForm, setLiveForm] = useState({ Meeting_URL: '', Provider: 'Zoom', Start_time: '', End_time: '', Status: 'scheduled', editingId: null });
   const [recForm, setRecForm] = useState({ Live_ID: null, Rec_Video_URL: '', Duration: '', editingId: null });
   const [assessmentForm, setAssessmentForm] = useState({ Title: '', Description: '', Total_Mark: 100, Passing_Mark: 40, Duration: 30, Attempt_Limit: 3, Status: 'active', editingId: null });

   const fetchFullCourse = async () => {
      const res = await authFetch(`${ADMIN_API}/course/${course.course_id}/full-details`);
      if (res.ok) {
         const data = await res.json();
         // ✅ Map content.videos → video so the list renders correctly
         const mapped = (data.course.modules || []).map(m => ({
            ...m,
            video: (m.content?.videos || m.video || []).map(v => ({
               ...v,
               video_id: v.video_id || v.Video_ID,
               video_url: v.video_url || v.Video_URL,
               course_description: v.description || v.course_description
            })),
            live_sessions: m.content?.live_sessions || m.live_sessions || [],
            assessments: m.content?.assessments || m.assessments || []
         }));
         setModules(mapped);
         return mapped;
      }
      return null;
   };

   const onModuleSubmit = async (data) => {
      setLoading(true);
      try {
         const isEdit = !!editingModule;
         const url = isEdit ? `${ADMIN_API}/update_module/${editingModule.module_id}` : `${ADMIN_API}/create_module`;
         const body = isEdit
            ? { Title: data.Title, Course_Description: data.Course_Description }
            : { Course_ID: course.course_id, Title: data.Title, Course_Description: data.Course_Description, Position: parseInt(data.Position) || modules.length + 1 };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) {
            showToast(isEdit ? 'Module updated' : 'Module created');
            clearCache(`details_${course.course_id}`);
            await fetchFullCourse();
            resetModule();
            setEditingModule(null);
            refresh();
         }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Module operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const onVideoSubmit = async (data) => {
      setLoading(true);
      try {
         const isEdit = !!videoEditingId;
         const url = isEdit ? `${ADMIN_API}/update_video/${videoEditingId}` : `${ADMIN_API}/create_video`;
         const body = { Course_ID: course.course_id, Module_ID: activeModuleId, Video_URL: data.video_url, course_description: data.course_description };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) {
            showToast(isEdit ? 'Lesson updated' : 'Lesson added');
            clearCache(`details_${course.course_id}`);
            await fetchFullCourse();
            resetVideo();
            setVideoEditingId(null);
            refresh();
         }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Video operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const onLiveSubmit = async (data) => {
      setLoading(true);
      try {
         const isEdit = !!liveEditingId;
         const url = isEdit ? `${ADMIN_API}/update_live_session/${liveEditingId}` : `${ADMIN_API}/create_live_session`;
         const body = {
            Course_ID: course.course_id, Module_ID: activeModuleId,
            Meeting_URL: data.Meeting_URL, Provider: data.Provider,
            Start_time: data.Start_time, End_time: data.End_time, Status: data.Status
         };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) {
            showToast(isEdit ? 'Live session updated' : 'Live session created');
            clearCache(`details_${course.course_id}`);
            await fetchFullCourse();
            resetLive();
            setLiveEditingId(null);
            refresh();
         }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Live session operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const onRecSubmit = async (data) => {
      setLoading(true);
      try {
         const isEdit = !!recEditingId;
         const url = isEdit ? `${ADMIN_API}/update_recorded_video/${recEditingId}` : `${ADMIN_API}/create_recorded_video`;
         const body = { Course_ID: course.course_id, Live_ID: recLiveId, Rec_Video_URL: data.Rec_Video_URL, Duration: data.Duration };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) { showToast(isEdit ? 'Recording updated' : 'Recording attached'); await fetchFullCourse(); resetRec(); setRecEditingId(null); setRecLiveId(null); }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Recording operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const onAssessmentSubmit = async (data) => {
      setLoading(true);
      try {
         const isEdit = !!assessmentEditingId;
         const url = isEdit ? `${ADMIN_API}/update_assessment/${assessmentEditingId}` : `${ADMIN_API}/create_assessment`;
         const body = {
            Module_ID: activeModuleId,
            Title: data.Title,
            Description: data.Description,
            Total_Mark: parseInt(data.Total_Mark),
            Passing_Mark: parseInt(data.Passing_Mark),
            Duration: parseInt(data.Duration),
            Attempt_Limit: parseInt(data.Attempt_Limit),
            Status: data.Status || 'active'
         };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) {
            showToast(isEdit ? 'Assessment updated' : 'Assessment created');
            await fetchFullCourse();
            resetAssessment();
            setAssessmentEditingId(null);
         } else {
            const err = await res.json();
            let msg = err.detail || err.message || 'Assessment operation failed';
            if (Array.isArray(err.detail)) msg = err.detail.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
            showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
         }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const deleteVideo = async (id) => {
      if (!(await confirm('Delete lesson?'))) return;
      const res = await authFetch(`${ADMIN_API}/delete-video/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Lesson removed'); await fetchFullCourse(); refresh(); }
   };

   const deleteLive = async (id) => {
      if (!(await confirm('Delete live session?'))) return;
      const res = await authFetch(`${ADMIN_API}/delete-live/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Live session removed'); await fetchFullCourse(); refresh(); }
   };

   const deleteRec = async (id) => {
      if (!(await confirm('Remove recording?'))) return;
      const res = await authFetch(`${ADMIN_API}/delete-recorded-video/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Recording removed'); await fetchFullCourse(); }
   };

   const deleteAssessment = async (id) => {
      if (!(await confirm('Erase this assessment and all its contents?'))) return;
      const res = await authFetch(`${ADMIN_API}/delete-assessment/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Assessment purged'); await fetchFullCourse(); }
      else { showToast('Purge failed', 'error'); }
   };

   const currentModule = modules.find(m => m.module_id === activeModuleId);

   return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(30px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
         <div style={{ width: '95%', maxWidth: '1200px', backgroundColor: 'var(--color-surface)', borderRadius: '3.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 150px rgba(0,0,0,0.3)', maxHeight: '95vh' }}>

            <div style={{ padding: '2rem 3.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', backgroundColor: activeModuleId ? '#f0fdf4' : '#f5f3ff', color: activeModuleId ? '#10b981' : '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {activeModuleId ? <Monitor size={28} /> : <Layers size={28} />}
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: 'var(--color-text)' }}>
                        {activeModuleId ? currentModule?.title : 'Curriculum Architecture'}
                     </h2>
                     <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-muted)' }}>
                        {activeModuleId ? 'Lesson Planning & Scheduling' : `Defining structure for: ${course.course_title}`}
                     </p>
                  </div>
               </div>
               <button onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={32} /></button>
            </div>

            <div style={{ padding: '2.5rem 3.5rem', display: 'grid', gridTemplateColumns: '1.3fr 1.7fr', gap: '4rem', overflowY: 'auto' }}>

               {/* LEFT SIDE: FORMS */}
               <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '3rem' }}>
                  {!activeModuleId ? (
                     <form onSubmit={submitModule(onModuleSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Section title={editingModule ? "Modify Module" : "Add Structure"}>
                           <FormInput label="Title" {...regModule('Title')} error={errModule.Title} placeholder="e.g. Chapter 1: Introduction" />
                           {!editingModule && <FormInput label="Position" type="number" {...regModule('Position')} error={errModule.Position} />}
                           <FormTextArea label="Overview" {...regModule('Course_Description')} error={errModule.Course_Description} rows={4} placeholder="What's this module about?" />
                        </Section>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                           {editingModule && <button type="button" onClick={() => { setEditingModule(null); resetModule(); }} style={{ flex: 1, padding: '1.15rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
                           <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.15rem', borderRadius: '1.25rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)' }}>
                              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Module'}
                           </button>
                        </div>
                     </form>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--color-surface-muted)', padding: '0.5rem', borderRadius: '1.25rem' }}>
                           <button onClick={() => setActiveTab('lessons')} style={{ flex: 1, padding: '0.75rem', borderRadius: '1rem', border: 'none', backgroundColor: activeTab === 'lessons' ? 'white' : 'transparent', color: activeTab === 'lessons' ? '#10b981' : 'var(--color-text-muted)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: activeTab === 'lessons' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                              <Video size={16} /> Recorded
                           </button>
                           <button onClick={() => setActiveTab('live')} style={{ flex: 1, padding: '0.75rem', borderRadius: '1rem', border: 'none', backgroundColor: activeTab === 'live' ? 'white' : 'transparent', color: activeTab === 'live' ? '#3b82f6' : 'var(--color-text-muted)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: activeTab === 'live' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                              <Calendar size={16} /> Live
                           </button>
                           <button onClick={() => setActiveTab('assessments')} style={{ flex: 1, padding: '0.75rem', borderRadius: '1rem', border: 'none', backgroundColor: activeTab === 'assessments' ? 'white' : 'transparent', color: activeTab === 'assessments' ? '#fb923c' : 'var(--color-text-muted)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: activeTab === 'assessments' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                              <Award size={16} /> Exams
                           </button>
                        </div>

                        {activeTab === 'lessons' ? (
                           <form onSubmit={submitVideo(onVideoSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                              <Section title={videoEditingId ? "Update Lesson" : "Add Recorded Lesson"}>
                                 <FormInput label="Lesson Name" {...regVideo('course_description')} error={errVideo.course_description} />
                                 <FormInput label="Video URL" {...regVideo('video_url')} error={errVideo.video_url} placeholder="Vimeo/YouTube..." />
                              </Section>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                 {videoEditingId && <button type="button" onClick={() => { resetVideo(); setVideoEditingId(null); }} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
                                 <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.15rem', borderRadius: '1.25rem', background: '#10b981', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Lesson'}
                                 </button>
                              </div>
                           </form>
                        ) : activeTab === 'live' ? (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              <form onSubmit={submitLive(onLiveSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                 <Section title="Live Session Schedule">
                                    <FormInput label="Meeting Link" {...regLive('Meeting_URL')} error={errLive.Meeting_URL} placeholder="https://zoom.us/j/..." />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>Provider</label>
                                          <select {...regLive('Provider')} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
                                             <option value="Zoom">Zoom</option>
                                             <option value="Google Meet">Google Meet</option>
                                             <option value="Microsoft Teams">Teams</option>
                                          </select>
                                          {errLive.Provider && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errLive.Provider.message}</span>}
                                       </div>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>Status</label>
                                          <select {...regLive('Status')} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
                                             <option value="scheduled">Scheduled</option>
                                             <option value="live">Running Now</option>
                                             <option value="completed">Finished</option>
                                          </select>
                                          {errLive.Status && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errLive.Status.message}</span>}
                                       </div>
                                    </div>
                                    <FormInput label="Starts At" type="datetime-local" {...regLive('Start_time')} error={errLive.Start_time} />
                                    <FormInput label="Ends At" type="datetime-local" {...regLive('End_time')} error={errLive.End_time} />
                                 </Section>
                                 <div style={{ display: 'flex', gap: '1rem' }}>
                                    {liveEditingId && <button type="button" onClick={() => { resetLive(); setLiveEditingId(null); }} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
                                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.15rem', borderRadius: '1.25rem', background: '#3b82f6', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                                       {loading ? <Loader2 size={18} className="animate-spin" /> : 'Schedule Live'}
                                    </button>
                                 </div>
                              </form>

                              {recLiveId && (
                                 <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '2rem', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'var(--color-text)' }}><Film size={20} /> Attach Session Recording</h3>
                                    <form onSubmit={submitRec(onRecSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                       <FormInput label="Recording URL" {...regRec('Rec_Video_URL')} error={errRec.Rec_Video_URL} placeholder="Vimeo/YouTube/CDN..." />
                                       <FormInput label="Duration" {...regRec('Duration')} error={errRec.Duration} placeholder="e.g. 1h 20m" />
                                       <div style={{ display: 'flex', gap: '1rem' }}>
                                          <button type="button" onClick={() => { resetRec(); setRecEditingId(null); setRecLiveId(null); }} style={{ flex: 1, padding: '0.85rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                          <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.85rem', borderRadius: '1rem', background: '#6366f1', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                                             {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Recording'}
                                          </button>
                                       </div>
                                    </form>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                              <form onSubmit={submitAssessment(onAssessmentSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                 <Section title={assessmentEditingId ? "Modify Assessment" : "New Exam/Quiz"}>
                                    <FormInput label="Title" {...regAssessment('Title')} error={errAssessment.Title} placeholder="e.g. Final Certification Exam" />
                                    <FormTextArea label="Instructions" {...regAssessment('Description')} error={errAssessment.Description} rows={3} placeholder="Guidelines for students..." />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                       <FormInput label="Total Marks" type="number" {...regAssessment('Total_Mark')} error={errAssessment.Total_Mark} />
                                       <FormInput label="Passing Marks" type="number" {...regAssessment('Passing_Mark')} error={errAssessment.Passing_Mark} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                       <FormInput label="Time Limit (Min)" type="number" {...regAssessment('Duration')} error={errAssessment.Duration} />
                                       <FormInput label="Max Attempts" type="number" {...regAssessment('Attempt_Limit')} error={errAssessment.Attempt_Limit} />
                                    </div>
                                 </Section>
                                 <div style={{ display: 'flex', gap: '1rem' }}>
                                    {assessmentEditingId && <button type="button" onClick={() => { resetAssessment(); setAssessmentEditingId(null); }} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
                                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.15rem', borderRadius: '1.25rem', background: '#fb923c', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                                       {loading ? <Loader2 size={18} className="animate-spin" /> : 'Deploy Assessment'}
                                    </button>
                                 </div>
                              </form>
                           </div>
                        )}
                        <button onClick={() => setActiveModuleId(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontWeight: '800', cursor: 'pointer', marginTop: '1rem' }}>← Back to All Modules</button>
                     </div>
                  )}
               </div>

               {/* RIGHT SIDE: LISTS */}
               <div>
                  {!activeModuleId ? (
                     <Section title={`Modules Overview (${modules.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                           {modules.map((m, idx) => (
                              <div key={m.module_id} onClick={() => setActiveModuleId(m.module_id)} style={{ padding: '1.5rem', borderRadius: '1.75rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }} className="module-item-hover">
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontWeight: '900', fontSize: '1.15rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>{m.position || idx + 1}</div>
                                    <div>
                                       <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text)' }}>{m.title}</h4>
                                       <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Video size={12} /> {m.video?.length || 0} Lessons</span>
                                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {m.live_sessions?.length || 0} Live</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => { setEditingModule(m); setModuleValue('Title', m.title); setModuleValue('Course_Description', m.description); setModuleValue('Position', m.position); }} style={{ padding: '0.6rem', borderRadius: '0.75rem', border: 'none', background: 'white', color: 'var(--color-text)', cursor: 'pointer' }}><Edit size={16} /></button>
                                    <button onClick={async () => { if (await confirm('Delete Module?')) { const res = await authFetch(`${ADMIN_API}/delete-module/${m.module_id}`, { method: 'DELETE' }); if (res.ok) { await fetchFullCourse(); refresh(); } } }} style={{ padding: '0.6rem', borderRadius: '0.75rem', border: 'none', background: 'white', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <style>{`.module-item-hover:hover { background-color: #f5f3ff !important; border-color: #ddd6fe !important; transform: translateX(8px); }`}</style>
                     </Section>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <Section title={activeTab === 'lessons' ? "Lesson Roster" : activeTab === 'live' ? "Live Calendar" : "Standard Exams"}>
                           {activeTab === 'lessons' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                 {(currentModule?.video || []).length === 0 ? <EmptyState icon={<Video size={40} />} title="No lessons registered" /> : currentModule.video.map((v, i) => (
                                    <div key={v.video_id} style={{ padding: '1.25rem', borderRadius: '1.5rem', background: '#f0fdf4', border: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                       <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Play size={16} fill="currentColor" /></div>
                                          <div>
                                             <p style={{ margin: 0, fontWeight: '800', color: '#064e3b' }}>{v.course_description}</p>
                                             <a href={v.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Link size={10} /> URL Validated</a>
                                          </div>
                                       </div>
                                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          <button onClick={() => { setVideoValue('video_url', v.video_url); setVideoValue('course_description', v.course_description); setVideoEditingId(v.video_id); }} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#10b981', cursor: 'pointer' }}><Edit size={14} /></button>
                                          <button onClick={() => deleteVideo(v.video_id)} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : activeTab === 'live' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                 {(currentModule?.live_sessions || []).length === 0 ? <EmptyState icon={<Calendar size={40} />} title="No sessions scheduled" /> : currentModule.live_sessions.map((l, i) => (
                                    <div key={l.live_id} style={{ padding: '1.25rem', borderRadius: '1.5rem', background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                             <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Monitor size={16} /></div>
                                             <div style={{ maxWidth: '200px' }}>
                                                <p style={{ margin: 0, fontWeight: '800', color: '#1e3a8a' }}>{l.provider} Session</p>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#60a5fa', fontWeight: '700' }}><Clock size={10} /> {new Date(l.start_time).toLocaleString()}</p>
                                             </div>
                                          </div>
                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                             <button onClick={() => { setLiveValue('Meeting_URL', l.meeting_url); setLiveValue('Provider', l.provider); setLiveValue('Start_time', l.start_time.split('.')[0]); setLiveValue('End_time', l.end_time.split('.')[0]); setLiveValue('Status', l.status); setLiveEditingId(l.live_id); }} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                                             <button onClick={() => deleteLive(l.live_id)} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                          </div>
                                       </div>

                                       {l.recorded_videos?.length > 0 ? (
                                          <div style={{ background: 'white', borderRadius: '1rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dbeafe' }}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Film size={14} color="#6366f1" />
                                                <div>
                                                   <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#4338ca' }}>Recording Available</p>
                                                   <p style={{ margin: 0, fontSize: '0.65rem', color: '#6366f1', fontWeight: '600' }}><Timer size={10} /> {l.recorded_videos[0].duration}</p>
                                                </div>
                                             </div>
                                             <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button onClick={() => { setRecLiveId(l.live_id); setRecValue('Rec_Video_URL', l.recorded_videos[0].rec_video_url); setRecValue('Duration', l.recorded_videos[0].duration); setRecEditingId(l.recorded_videos[0].rec_video_id); }} style={{ border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer' }}><Edit size={12} /></button>
                                                <button onClick={() => deleteRec(l.recorded_videos[0].rec_video_id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                             </div>
                                          </div>
                                       ) : (
                                          l.status === 'completed' && (
                                             <button onClick={() => { setRecLiveId(l.live_id); resetRec(); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.85rem', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                <PlusCircle size={14} /> Attach Recording
                                             </button>
                                          )
                                       )}
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                 {(currentModule?.assessments || []).length === 0 ? <EmptyState icon={<Award size={40} />} title="No assessments found" /> : currentModule.assessments.map((a, i) => (
                                    <div key={a.assessment_id} style={{ padding: '1.25rem', borderRadius: '1.5rem', background: '#fff7ed', border: '1px solid #ffedd5', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                             <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c' }}><Target size={16} /></div>
                                             <div>
                                                <p style={{ margin: 0, fontWeight: '800', color: '#9a3412' }}>{a.title}</p>
                                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                                                   <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c2410c', textTransform: 'uppercase' }}>{a.total_mark} Marks</span>
                                                   <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c2410c', textTransform: 'uppercase' }}>{a.duration} Mins</span>
                                                </div>
                                             </div>
                                          </div>
                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                             <button onClick={() => { setAssessmentValue('Title', a.title); setAssessmentValue('Description', a.description); setAssessmentValue('Total_Mark', a.total_mark); setAssessmentValue('Passing_Mark', a.passing_mark); setAssessmentValue('Duration', a.duration); setAssessmentValue('Attempt_Limit', a.attempt_limit); setAssessmentValue('Status', a.status); setAssessmentEditingId(a.assessment_id); }} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#fb923c', cursor: 'pointer' }}><Edit size={14} /></button>
                                             <button onClick={() => deleteAssessment(a.assessment_id)} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </Section>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

const EmptyState = ({ icon, title }) => (
   <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-surface-muted)', borderRadius: '2rem', border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)' }}>
      <div style={{ marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
      <p style={{ margin: 0, fontWeight: '800' }}>{title}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', fontWeight: '600' }}>Your contents will appear here</p>
   </div>
);

