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


export const ManageNotesModal = ({ course, onClose, showToast, refresh }) => {
  const confirm = useConfirm();
   const { authFetch, clearCache } = useAuth();
   const [loading, setLoading] = useState(false);
   const [notes, setNotes] = useState(course.notes || []);
   const [editingNote, setEditingNote] = useState(null);

   const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
      resolver: zodResolver(notesSchema),
      defaultValues: {
         Title: '',
         File_URL: '',
         File_Type: 'pdf'
      }
   });

   useEffect(() => {
      if (editingNote) {
         setValue('Title', editingNote.title || '');
         setValue('File_URL', editingNote.file_url || editingNote.note_url || '');
         setValue('File_Type', editingNote.file_type || 'pdf');
      } else {
         reset();
      }
   }, [editingNote, setValue, reset]);

   const onSubmit = async (data) => {
      setLoading(true);
      try {
         const isEdit = !!editingNote;
         const url = isEdit
            ? `${ADMIN_API}/update_notes/${editingNote.notes_id}`
            : `${ADMIN_API}/create_notes`;

         const method = isEdit ? 'PUT' : 'POST';
         const body = isEdit
            ? { Title: data.Title, File_URL: data.File_URL, File_Type: data.File_Type }
            : { Course_ID: course.course_id, Title: data.Title, File_URL: data.File_URL, File_Type: data.File_Type };

         const res = await authFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
         });

         if (res.ok) {
            showToast(isEdit ? 'Notes updated' : 'Notes added');
            clearCache(`details_${course.course_id}`);
            const detailRes = await authFetch(`${ADMIN_API}/course/${course.course_id}/full-details`);
            if (detailRes.ok) {
               const detailData = await detailRes.json();
               setNotes(detailData.course.notes || []);
            }
            reset();
            setEditingNote(null);
            refresh();
         } else {
            const err = await res.json();
            showToast(err.detail || 'Notes operation failed', 'error');
         }
      } catch (err) {
         showToast('Connection error', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (notesId) => {
      if (!(await confirm('Delete these course notes?'))) return;
      try {
         const res = await authFetch(`${ADMIN_API}/delete-notes/${notesId}`, {
            method: 'DELETE'
         });
         if (res.ok) {
            setNotes(notes.filter(n => n.notes_id !== notesId));
            showToast('Notes removed');
            clearCache(`details_${course.course_id}`);
            refresh();
         } else {
            showToast('Removal failed', 'error');
         }
      } catch (e) { showToast('Sync error', 'error'); }
   };

   const startEdit = (n) => {
      setEditingNote(n);
   };

   return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(30px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
         <div style={{
            width: '95%', maxWidth: '1000px', backgroundColor: 'var(--color-surface)',
            borderRadius: '3.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 50px 150px rgba(0,0,0,0.3)', maxHeight: '90vh'
         }}>
            <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <FileText size={28} />
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: 'var(--color-text)' }}>Manage Resources</h2>
                     <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-muted)' }}>Supplemental documents for: {course.course_title}</p>
                  </div>
               </div>
               <button onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={32} /></button>
            </div>

            <div style={{ padding: '2.5rem 3.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', overflowY: 'auto' }}>
               <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '2.5rem' }}>
                  <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title={editingNote ? "Update Document" : "Register New Resource"}>
                        <FormInput label="Resource Title" {...register('Title')} error={errors.Title} placeholder="e.g. Course Roadmap PDF" />
                        <FormInput label="Document URL" {...register('File_URL')} error={errors.File_URL} placeholder="https://cdn..." />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                           <label style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>Format</label>
                           <select {...register('File_Type')} style={{ backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', padding: '1.15rem' }}>
                              <option value="pdf">Portable Document (PDF)</option>
                              <option value="doc">Word Document</option>
                              <option value="ppt">Presentation</option>
                              <option value="zip">Archive (ZIP)</option>
                              <option value="link">External Link</option>
                           </select>
                           {errors.File_Type && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>{errors.File_Type.message}</span>}
                        </div>
                     </Section>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        {editingNote && (
                           <button type="button" onClick={() => { setEditingNote(null); reset(); }} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer', background: 'white' }}>Cancel</button>
                        )}
                        <button type="submit" disabled={loading} style={{
                           flex: 2, padding: '1rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                           color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                        }}>
                           {loading ? <Loader2 size={18} className="animate-spin" /> : (editingNote ? <Edit size={18} /> : <PlusCircle size={18} />)}
                           {editingNote ? 'Update Notes' : 'Add Resource'}
                        </button>
                     </div>
                  </form>
               </div>

               <div>
                  <Section title={`Attached Resources (${notes.length})`}>
                     {notes.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-surface-muted)', borderRadius: '2rem', border: '2px dashed var(--color-border)' }}>
                           <FileText size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                           <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-muted)' }}>No documents attached</p>
                           <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Include PDFs or reading materials here</p>
                        </div>
                     ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           {notes.map(n => (
                              <div key={n.notes_id} style={{
                                 padding: '1.25rem', borderRadius: '1.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)',
                                 display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                       <FileText size={16} />
                                    </div>
                                    <div>
                                       <p style={{ margin: 0, fontWeight: '800', color: 'var(--color-text)', fontSize: '0.95rem' }}>{n.title}</p>
                                       <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{n.file_type.toUpperCase()} • {n.file_url.substring(0, 30)}...</p>
                                    </div>
                                 </div>
                                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(n)} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', border: 'none', backgroundColor: '#fff1f2', color: '#e11d48', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                                       <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(n.notes_id)} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove">
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </Section>
               </div>
            </div>
         </div>
      </div>
   );
};