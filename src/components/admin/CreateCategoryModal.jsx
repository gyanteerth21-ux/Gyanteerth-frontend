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


export const CreateCategoryModal = ({ onClose, refresh, showToast, categories }) => {
   const { authFetch } = useAuth();
   const [loading, setLoading] = useState(false);

   const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(
         z.object({
            Category_Name: z.string().min(2, "Category name must be at least 2 characters"),
            slug: z.string().optional(),
            Course_Description: z.string().min(5, "Please provide a description"),
            Icon: z.string().optional(),
            Thumbnail: z.string().optional()
         })
      ),
      defaultValues: {
         Category_Name: '',
         slug: '',
         Course_Description: '',
         Icon: '📁',
         Thumbnail: ''
      }
   });

   const onSubmit = async (data) => {
      setLoading(true);
      try {
         const res = await authFetch(`${ADMIN_API}/create-category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...data,
               Thumbnail: data.Thumbnail || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800'
            })
         });

         if (res.ok) {
            showToast('Category created successfully');
            refresh();
            onClose();
         } else {
            const err = await res.json();
            console.error('Category Creation Failed:', err);
            showToast(err.detail || err.message || 'Access denied or invalid data', 'error');
         }
      } catch (err) {
         showToast('Network synchronization error', 'error');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(30px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
         <form onSubmit={handleSubmit(onSubmit)} style={{
            width: '95%', maxWidth: '900px', backgroundColor: 'var(--color-surface)',
            borderRadius: '3.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 50px 150px rgba(0,0,0,0.3)', boxSizing: 'border-box',
            border: '1px solid var(--color-border)'
         }}>
            <div style={{ padding: '3rem 4rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: '1.5rem', backgroundColor: 'var(--color-primary)15', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <FolderPlus size={32} />
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '2.25rem', fontWeight: '900', color: 'var(--color-text)' }}>Create Category</h2>
                     <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-muted)' }}>Add a new domain to the course catalog</p>
                  </div>
               </div>
               <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={32} /></button>
            </div>

            <div style={{ padding: '3rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', overflowX: 'hidden', boxSizing: 'border-box' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <Section title="Category Identity">
                     <FormInput label="Category Name" {...register('Category_Name')} error={errors.Category_Name} placeholder="e.g. Programming" />
                     <FormInput label="Slug" {...register('slug')} error={errors.slug} placeholder="programming" />
                  </Section>
                  <Section title="Visual Assets">
                     <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1.5rem' }}>
                        <FormInput label="Icon" {...register('Icon')} error={errors.Icon} placeholder="📁" />
                        <FormInput label="Thumbnail URL" {...register('Thumbnail')} error={errors.Thumbnail} limit={2000} placeholder="https://..." />
                     </div>
                  </Section>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <Section title="Description">
                     <FormTextArea label="Course Description" {...register('Course_Description')} error={errors.Course_Description} rows={10} placeholder="Provide details about what courses this category covers..." />
                  </Section>
               </div>
            </div>

            <div style={{ padding: '2.5rem 4rem', backgroundColor: 'var(--color-surface-muted)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
               <button type="button" onClick={onClose} style={{ padding: '1rem 2.5rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', fontWeight: '800', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none' }}>Cancel</button>
               <button type="submit" disabled={loading} style={{
                  padding: '1rem 4rem', borderRadius: '1.25rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem'
               }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <FolderPlus size={18} />}
                  Create Category
               </button>
            </div>
         </form>
      </div>
   );
};

