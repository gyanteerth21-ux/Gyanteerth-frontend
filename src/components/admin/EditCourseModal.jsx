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


export const EditCourseModal = ({ course, onClose, trainers, categories, showToast, refresh }) => {
   const { authFetch, clearCache } = useAuth();
   const [loading, setLoading] = useState(false);

   const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(courseSchema.extend({
         skill_set: z.string().optional()
      })),
      defaultValues: {
         instructor_id: course.instructor_id || course.trainer_id || '',
         category_id: course.category_id || '',
         course_Type: (course.course_Type || course.type || 'recorded').toLowerCase(),
         course_title: course.course_title || course.title || '',
         course_description: course.course_description || course.description || '',
         skill_set: course.skill_set || course.key_skill || '',
         required_knowledge: course.required_knowledge || course.required_knowlegde || '',
         benefits: course.benefits || '',
         thumbnail: course.thumbnail || '',
         duration: course.duration || course.duration_hours || '',
         level: course.level || 'Beginner',
         language: course.language || 'English',
         original_pay: Number(course.original_pay || course.price?.original) || 0,
         discount_pay: Number(course.discount_pay || course.price?.discount) || 0
      }
   });

   const onSubmit = async (data) => {
      if (!data.instructor_id || !data.category_id) return showToast('Instructor & Category are required', 'error');
      setLoading(true);
      try {
         const res = await authFetch(`${ADMIN_API}/update_course/${course.course_id}?instructor_id=${data.instructor_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               category_id: data.category_id,
               course_Type: data.course_Type.toLowerCase().trim(),
               type: data.course_Type.toLowerCase().trim(),
               course_title: data.course_title,
               course_description: data.course_description,
               skill_set: data.skill_set,
               required_knowledge: data.required_knowledge,
               benefits: data.benefits,
               thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
               duration: data.duration,
               level: data.level,
               language: data.language,
               original_pay: Number(data.original_pay) || 0,
               discount_pay: Number(data.discount_pay) || 0
            })
         });
         if (res.ok) {
            showToast('Course profile updated');
            clearCache('admin_course_ids');
            clearCache(`details_${course.course_id}`);
            refresh();
            onClose();
         }
         else {
            const err = await res.json();
            let msg = err.detail || err.message || 'Update failed';
            if (Array.isArray(err.detail)) msg = err.detail.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
            if (res.status === 500 || err.error === 'HTTP 500') {
               msg = 'Internal server error occurred while updating course. Please try again.';
            }
            showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
         }
      } catch (err) { showToast('Sync error', 'error'); }
      finally { setLoading(false); }
   };

   return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
         <form onSubmit={handleSubmit(onSubmit)} style={{
            width: '100%', maxWidth: '1200px', backgroundColor: 'var(--color-surface)',
            borderRadius: '2.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-2xl)', border: '1px solid var(--color-border)', maxHeight: '95vh'
         }}>
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-muted)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', backgroundColor: '#fff7ed', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffedd5' }}>
                     <Edit size={24} />
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '950', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Edit Information</h2>
                     <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>{course.course_title}</p>
                  </div>
               </div>
               <button type="button" onClick={onClose} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', backgroundColor: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
               </button>
            </div>

            <div style={{ padding: '2rem 2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title="Asset Details" icon={Target}>
                        <FormInput label="Update Title" {...register('course_title')} error={errors.course_title} />
                        <FormSelect label="Assigned Faculty" {...register('instructor_id')} error={errors.instructor_id}>
                           <option value="">Select Faculty</option>
                           {trainers.map(t => <option key={t.id} value={t.id}>{t.email}</option>)}
                        </FormSelect>
                        <FormSelect label="Primary Domain" {...register('category_id')} error={errors.category_id}>
                           {categories.map(c => <option key={c.Category_ID} value={c.Category_ID}>{c.Category_Name}</option>)}
                        </FormSelect>
                     </Section>

                     <Section title="Strategic Content" icon={BookOpen}>
                        <FormTextArea label="Course Description Narrative" {...register('course_description')} error={errors.course_description} />
                        <FormTextArea label="Global Benefits & Outcomes" {...register('benefits')} error={errors.benefits} />
                        <FormTextArea label="Required Prerequisites & Knowledge" {...register('required_knowledge')} error={errors.required_knowledge} />
                     </Section>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title="Economics & Delivery" icon={ShieldCheck}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                           <FormInput label="Original Pay (₹)" type="number" {...register('original_pay')} error={errors.original_pay} />
                           <FormInput label="Discounted Pay (₹)" type="number" {...register('discount_pay')} error={errors.discount_pay} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                           <FormSelect label="Content Delivery" {...register('course_Type')} error={errors.course_Type}>
                              <option value="recorded">Recorded Content</option>
                              <option value="live">Live Transmission</option>
                           </FormSelect>
                           <FormSelect label="Difficulty Tier" {...register('level')} error={errors.level}>
                              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                           </FormSelect>
                        </div>
                     </Section>

                     <Section title="Logistics & Assets" icon={Calendar}>
                        <FormInput label="Architecture Duration" {...register('duration')} error={errors.duration} />
                        <FormInput label="Primary Language" {...register('language')} error={errors.language} />
                        <FormInput label="Strategic Banner URL" limit={2000} {...register('thumbnail')} error={errors.thumbnail} />
                     </Section>
                  </div>
               </div>
            </div>

            <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--color-surface-muted)' }}>
               <button type="button" onClick={onClose} style={{ padding: '0.85rem 2rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', color: 'var(--color-text-muted)', cursor: 'pointer', backgroundColor: 'white' }}>Cancel</button>
               <button type="submit" disabled={loading} style={{
                  padding: '0.85rem 3rem', borderRadius: '1rem', background: '#f97316',
                  color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px -5px rgba(249, 115, 22, 0.3)'
               }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Commit Update
               </button>
            </div>
         </form>
      </div>
   );
};

