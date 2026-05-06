import React, { useState } from 'react';
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

const FormInput = ({ label, ...props }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>{label}</label>
      <input {...props} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '0.85rem 1rem', color: 'var(--color-text)', fontWeight: '600', outline: 'none', transition: 'all 0.2s', fontSize: '0.9rem' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}/>
   </div>
);

const FormTextArea = ({ label, ...props }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', gridColumn: '1 / -1' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>{label}</label>
      <textarea {...props} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1rem', color: 'var(--color-text)', fontWeight: '600', outline: 'none', resize: 'none', minHeight: '80px', transition: 'all 0.2s', fontSize: '0.9rem' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}/>
   </div>
);

const FormSelect = ({ label, children, ...props }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>{label}</label>
      <select {...props} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '0.85rem 1rem', color: 'var(--color-text)', fontWeight: '600', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
         {children}
      </select>
   </div>
);

export const CreateCategoryModal = ({ onClose, refresh, showToast, categories }) => {
   const { authFetch } = useAuth();
   const [loading, setLoading] = useState(false);

   const [formData, setFormData] = useState({
      Category_Name: '',
      slug: '',
      Parent_ID: null,
      Course_Description: '',
      Icon: '📁',
      Thumbnail: ''
   });

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const res = await authFetch(`${ADMIN_API}/create-category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...formData,
               Thumbnail: formData.Thumbnail || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800'
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
         <form onSubmit={handleSubmit} style={{
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
                     <FormInput label="Category Name" value={formData.Category_Name} onChange={e => setFormData({ ...formData, Category_Name: e.target.value })} placeholder="e.g. Programming" required />
                     <FormInput label="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="programming" />
                  </Section>
                  <Section title="Visual Assets">
                     <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1.5rem' }}>
                        <FormInput label="Icon" value={formData.Icon} onChange={e => setFormData({ ...formData, Icon: e.target.value })} placeholder="📁" />
                        <FormInput label="Thumbnail URL" value={formData.Thumbnail} onChange={e => setFormData({ ...formData, Thumbnail: e.target.value })} placeholder="https://..." />
                     </div>
                  </Section>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <Section title="Description">
                     <FormTextArea label="Course Description" value={formData.Course_Description} onChange={e => setFormData({ ...formData, Course_Description: e.target.value })} rows={10} placeholder="Provide details about what courses this category covers..." required />
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

export const CreateCourseModal = ({ onClose, trainers, categories, showToast, refresh, initialCategoryId = '' }) => {
   const { authFetch, clearCache } = useAuth();
   const [loading, setLoading] = useState(false);

   const [formData, setFormData] = useState({
      instructor_id: '',
      category_id: initialCategoryId,
      course_Type: 'recorded',
      course_title: '',
      course_description: '',
      skill_set: '',
      required_knowledge: '',
      benefits: '',
      thumbnail: '',
      duration: '',
      level: 'Beginner',
      language: 'English',
      original_pay: 0,
      discount_pay: 0
   });

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.instructor_id || !formData.category_id) return showToast('Instructor & Category are required', 'error');
      setLoading(true);
      try {
         const res = await authFetch(`${ADMIN_API}/create_course?instructor_id=${formData.instructor_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               category_id: formData.category_id,
               course_Type: formData.course_Type.toLowerCase().trim(),
               course_title: formData.course_title,
               course_description: formData.course_description,
               skill_set: formData.skill_set,
               required_knowledge: formData.required_knowledge,
               benefits: formData.benefits,
               thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
               duration: formData.duration,
               level: formData.level,
               language: formData.language,
               original_pay: Number(formData.original_pay) || 0,
               discount_pay: Number(formData.discount_pay) || 0
            })
         });
         if (res.ok) { 
            showToast('Course profile initialized'); 
            clearCache('admin_course_ids');
            clearCache('admin_categories');
            refresh(); 
            onClose(); 
         }
         else { 
            const err = await res.json(); 
            let msg = err.detail || err.message || 'Creation failed';
            if (Array.isArray(err.detail)) msg = err.detail.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
            showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error'); 
         }
      } catch (err) { showToast('Sync error', 'error'); }
      finally { setLoading(false); }
   };

   return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
         <form onSubmit={handleSubmit} style={{
            width: '100%', maxWidth: '1200px', backgroundColor: 'var(--color-surface)',
            borderRadius: '2.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-2xl)', border: '1px solid var(--color-border)', maxHeight: '95vh'
         }}>
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-muted)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)20' }}>
                     <PlusCircle size={24} />
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '950', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Create Course</h2>
                     <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>Configure core parameters and curriculum</p>
                  </div>
               </div>
               <button type="button" onClick={onClose} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', backgroundColor: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                  <X size={20} />
               </button>
            </div>

            <div style={{ padding: '2rem 2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title="Identity & Categorization" icon={Target}>
                        <FormInput label="Strategic Course Title" value={formData.course_title} onChange={e => setFormData({ ...formData, course_title: e.target.value })} placeholder="e.g. Advanced System Engineering" required />
                        <FormSelect label="Assign Expert Instructor" value={formData.instructor_id} onChange={e => setFormData({ ...formData, instructor_id: e.target.value })}>
                           <option value="">Select Faculty</option>
                           {trainers.map(t => <option key={t.id} value={t.id}>{t.name || t.email}</option>)}
                        </FormSelect>
                        <FormSelect label="Course Domain / Category" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                           <option value="">Select Category</option>
                           {categories.map(c => <option key={c.Category_ID} value={c.Category_ID}>{c.Category_Name}</option>)}
                        </FormSelect>
                     </Section>

                     <Section title="Learning Blueprint" icon={BookOpen}>
                        <FormTextArea label="Curriculum Narrative (Max 500)" value={formData.course_description} onChange={e => setFormData({ ...formData, course_description: e.target.value })} placeholder="Describe the core learning journey..." required />
                        <FormTextArea label="Strategic Outcomes & Benefits" value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} placeholder="What will the student master?" />
                        <FormInput label="Primary Skill Set (Comma separated)" value={formData.skill_set} onChange={e => setFormData({ ...formData, skill_set: e.target.value })} placeholder="Python, AWS, Architecture..." />
                     </Section>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title="Economics & Format" icon={ShieldCheck}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                           <FormInput label="Base Price (₹)" type="number" value={formData.original_pay} onChange={e => setFormData({ ...formData, original_pay: e.target.value })} />
                           <FormInput label="Discounted (₹)" type="number" value={formData.discount_pay} onChange={e => setFormData({ ...formData, discount_pay: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                           <FormSelect label="Session Format" value={formData.course_Type} onChange={e => setFormData({ ...formData, course_Type: e.target.value })}>
                              <option value="recorded">On-Demand Recorded</option>
                              <option value="live">Interactive Live</option>
                           </FormSelect>
                           <FormSelect label="Complexity Level" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                           </FormSelect>
                        </div>
                     </Section>

                     <Section title="Metadata & Logistics" icon={Calendar}>
                        <FormInput label="Estimated Duration" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 45 Hours" />
                        <FormInput label="Instruction Language" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} />
                        <FormInput label="Banner/Thumbnail URL" value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="https://unsplash.com/..." />
                     </Section>
                  </div>
               </div>
            </div>

            <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--color-surface-muted)' }}>
               <button type="button" onClick={onClose} style={{ padding: '0.85rem 2rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', color: 'var(--color-text-muted)', cursor: 'pointer', backgroundColor: 'white' }}>Cancel</button>
               <button type="submit" disabled={loading} style={{
                  padding: '0.85rem 3rem', borderRadius: '1rem', background: 'var(--color-primary)',
                  color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px -5px var(--color-primary-bg)'
               }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Initialize Architecture
               </button>
            </div>
         </form>
      </div>
   );
};

export const EditCourseModal = ({ course, onClose, trainers, categories, showToast, refresh }) => {
   const { authFetch, clearCache } = useAuth();
   const [loading, setLoading] = useState(false);

   const [formData, setFormData] = useState({
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
   });

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.instructor_id || !formData.category_id) return showToast('Instructor & Category are required', 'error');
      setLoading(true);
      try {
         const res = await authFetch(`${ADMIN_API}/update_course/${course.course_id}?instructor_id=${formData.instructor_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               category_id: formData.category_id,
               course_Type: formData.course_Type.toLowerCase().trim(),
               type: formData.course_Type.toLowerCase().trim(),
               course_title: formData.course_title,
               course_description: formData.course_description,
               skill_set: formData.skill_set,
               required_knowledge: formData.required_knowledge,
               benefits: formData.benefits,
               thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
               duration: formData.duration,
               level: formData.level,
               language: formData.language,
               original_pay: Number(formData.original_pay) || 0,
               discount_pay: Number(formData.discount_pay) || 0
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
            showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error'); 
         }
      } catch (err) { showToast('Sync error', 'error'); }
      finally { setLoading(false); }
   };

   return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
         <form onSubmit={handleSubmit} style={{
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
                        <FormInput label="Update Title" value={formData.course_title} onChange={e => setFormData({ ...formData, course_title: e.target.value })} required />
                        <FormSelect label="Assigned Faculty" value={formData.instructor_id} onChange={e => setFormData({ ...formData, instructor_id: e.target.value })}>
                           <option value="">Select Faculty</option>
                           {trainers.map(t => <option key={t.id} value={t.id}>{t.email}</option>)}
                        </FormSelect>
                        <FormSelect label="Primary Domain" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                           {categories.map(c => <option key={c.Category_ID} value={c.Category_ID}>{c.Category_Name}</option>)}
                        </FormSelect>
                     </Section>

                     <Section title="Strategic Content" icon={BookOpen}>
                        <FormTextArea label="Course Description Narrative" value={formData.course_description} onChange={e => setFormData({ ...formData, course_description: e.target.value })} />
                        <FormTextArea label="Global Benefits & Outcomes" value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} />
                        <FormInput label="Tools & Frameworks" value={formData.skill_set} onChange={e => setFormData({ ...formData, skill_set: e.target.value })} />
                     </Section>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title="Economics & Delivery" icon={ShieldCheck}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                           <FormInput label="Original Pay (₹)" type="number" value={formData.original_pay} onChange={e => setFormData({ ...formData, original_pay: e.target.value })} />
                           <FormInput label="Discounted Pay (₹)" type="number" value={formData.discount_pay} onChange={e => setFormData({ ...formData, discount_pay: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                           <FormSelect label="Content Delivery" value={formData.course_Type} onChange={e => setFormData({ ...formData, course_Type: e.target.value })}>
                              <option value="recorded">Recorded Content</option>
                              <option value="live">Live Transmission</option>
                           </FormSelect>
                           <FormSelect label="Difficulty Tier" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                           </FormSelect>
                        </div>
                     </Section>

                     <Section title="Logistics & Assets" icon={Calendar}>
                        <FormInput label="Architecture Duration" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                        <FormInput label="Primary Language" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} />
                        <FormInput label="Strategic Banner URL" value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} />
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

export const ManageDemoModal = ({ course, onClose, showToast, refresh }) => {
   const { authFetch } = useAuth();
   const [loading, setLoading] = useState(false);
   const [demos, setDemos] = useState(course.demo || []);
   const [editingDemo, setEditingDemo] = useState(null);

   const [formData, setFormData] = useState({
      title: '',
      video_url: '',
      duration: ''
   });

   const handleAddOrUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!editingDemo;
         const url = isEdit
            ? `${ADMIN_API}/update_course_demo/${editingDemo.demo_id}`
            : `${ADMIN_API}/add_course_demo`;

         const method = isEdit ? 'PUT' : 'POST';
         const body = isEdit
            ? { title: formData.title, video_url: formData.video_url, duration: formData.duration }
            : { course_id: course.course_id, title: formData.title, video_url: formData.video_url, duration: formData.duration };

         const res = await authFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
         });

         if (res.ok) {
            showToast(isEdit ? 'Demo updated' : 'Demo added');
            // Bust detail cache to show dynamic changes
            clearCache(`details_${course.course_id}`);
            // Fetch updated course details to sync demos
            const detailRes = await authFetch(`${ADMIN_API}/course/${course.course_id}/full-details`);
            if (detailRes.ok) {
               const data = await detailRes.json();
               setDemos(data.course.demo || []);
            }
            setFormData({ title: '', video_url: '', duration: '' });
            setEditingDemo(null);
            refresh(); // Refresh parent dashboard if needed
         } else {
            const err = await res.json();
            showToast(err.detail || err.message || 'Demo operation failed', 'error');
         }
      } catch (err) {
         showToast('Connection error', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (demoId) => {
      if (!window.confirm('Remove this demo video?')) return;
      try {
         const res = await authFetch(`${ADMIN_API}/delete-demo/${demoId}`, {
            method: 'DELETE'
         });
         if (res.ok) {
            setDemos(demos.filter(d => d.demo_id !== demoId));
            showToast('Demo removed');
            refresh();
         } else {
            showToast('Removal failed', 'error');
         }
      } catch (e) { showToast('Sync error', 'error'); }
   };

   const startEdit = (demo) => {
      setEditingDemo(demo);
      setFormData({
         title: demo.title,
         video_url: demo.video_url,
         duration: demo.duration
      });
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
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--color-surface-muted)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Video size={28} />
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: 'var(--color-text)' }}>Manage Demos</h2>
                     <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-muted)' }}>Course: {course.course_title}</p>
                  </div>
               </div>
               <button onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={32} /></button>
            </div>

            <div style={{ padding: '2.5rem 3.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', overflowY: 'auto' }}>
               {/* Left: Form */}
               <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '2.5rem' }}>
                  <form onSubmit={handleAddOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title={editingDemo ? "Update Demo" : "Add Demo Video"}>
                        <FormInput label="Video Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Module 1 Preview" required />
                        <FormInput label="Video URL" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://vimeo.com/..." required />
                        <FormInput label="Duration" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 5:30" required />
                     </Section>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        {editingDemo && (
                           <button type="button" onClick={() => { setEditingDemo(null); setFormData({ title: '', video_url: '', duration: '' }); }} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                        )}
                        <button type="submit" disabled={loading} style={{
                           flex: 2, padding: '1rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                           color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                        }}>
                           {loading ? <Loader2 size={18} className="animate-spin" /> : (editingDemo ? <Edit size={18} /> : <PlusCircle size={18} />)}
                           {editingDemo ? 'Update Demo' : 'Add Demo'}
                        </button>
                     </div>
                  </form>
               </div>

               {/* Right: List */}
               <div>
                  <Section title={`Published Demos (${demos.length})`}>
                     {demos.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-surface-muted)', borderRadius: '2rem', border: '2px dashed var(--color-border)' }}>
                           <Info size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                           <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-muted)' }}>No demo videos added yet</p>
                           <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Preview videos help students decide to enroll</p>
                        </div>
                     ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           {demos.map(demo => (
                              <div key={demo.demo_id} style={{
                                 padding: '1.25rem', borderRadius: '1.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)',
                                 display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                       <Play size={16} fill="currentColor" />
                                    </div>
                                    <div>
                                       <p style={{ margin: 0, fontWeight: '800', color: 'var(--color-text)', fontSize: '0.95rem' }}>{demo.title}</p>
                                       <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{demo.duration} • {demo.video_url.substring(0, 30)}...</p>
                                    </div>
                                 </div>
                                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(demo)} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', border: 'none', backgroundColor: '#fff7ed', color: '#fb923c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                                       <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(demo.demo_id)} style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove">
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

export const ManageModuleModal = ({ course, onClose, showToast, refresh }) => {
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

   const handleAddOrUpdateModule = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!editingModule;
         const url = isEdit ? `${ADMIN_API}/update_module/${editingModule.module_id}` : `${ADMIN_API}/create_module`;
         const body = isEdit
            ? { Title: formData.Title, Course_Description: formData.Course_Description }
            : { Course_ID: course.course_id, Title: formData.Title, Course_Description: formData.Course_Description, Position: parseInt(formData.Position) };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) { 
            showToast(isEdit ? 'Module updated' : 'Module created'); 
            clearCache(`details_${course.course_id}`);
            await fetchFullCourse(); 
            setFormData({ Title: '', Course_Description: '', Position: modules.length + 1 }); 
            setEditingModule(null); 
            refresh(); 
         }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Module operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const handleVideoSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!videoForm.editingId;
         const url = isEdit ? `${ADMIN_API}/update_video/${videoForm.editingId}` : `${ADMIN_API}/create_video`;
         const body = { Course_ID: course.course_id, Module_ID: activeModuleId, Video_URL: videoForm.Video_URL, course_description: videoForm.course_description };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) { 
            showToast(isEdit ? 'Lesson updated' : 'Lesson added'); 
            clearCache(`details_${course.course_id}`);
            await fetchFullCourse(); 
            setVideoForm({ Video_URL: '', course_description: '', editingId: null }); 
            refresh(); 
         }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Video operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const handleLiveSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!liveForm.editingId;
         const url = isEdit ? `${ADMIN_API}/update_live_session/${liveForm.editingId}` : `${ADMIN_API}/create_live_session`;
         const body = {
            Course_ID: course.course_id, Module_ID: activeModuleId,
            Meeting_URL: liveForm.Meeting_URL, Provider: liveForm.Provider,
            Start_time: liveForm.Start_time, End_time: liveForm.End_time, Status: liveForm.Status
         };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) { 
            showToast(isEdit ? 'Live session updated' : 'Live session created'); 
            clearCache(`details_${course.course_id}`);
            await fetchFullCourse(); 
            setLiveForm({ Meeting_URL: '', Provider: 'Zoom', Start_time: '', End_time: '', Status: 'scheduled', editingId: null }); 
            refresh(); 
         }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Live session operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const handleRecSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!recForm.editingId;
         const url = isEdit ? `${ADMIN_API}/update_recorded_video/${recForm.editingId}` : `${ADMIN_API}/create_recorded_video`;
         const body = { Course_ID: course.course_id, Live_ID: recForm.Live_ID, Rec_Video_URL: recForm.Rec_Video_URL, Duration: recForm.Duration };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) { showToast(isEdit ? 'Recording updated' : 'Recording attached'); await fetchFullCourse(); setRecForm({ Live_ID: null, Rec_Video_URL: '', Duration: '', editingId: null }); }
         else { const err = await res.json(); showToast(err.detail || err.message || 'Recording operation failed', 'error'); }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const handleAssessmentSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!assessmentForm.editingId;
         const url = isEdit ? `${ADMIN_API}/update_assessment/${assessmentForm.editingId}` : `${ADMIN_API}/create_assessment`;
         const body = {
            Module_ID: activeModuleId,
            Title: assessmentForm.Title,
            Description: assessmentForm.Description,
            Total_Mark: parseInt(assessmentForm.Total_Mark),
            Passing_Mark: parseInt(assessmentForm.Passing_Mark),
            Duration: parseInt(assessmentForm.Duration),
            Attempt_Limit: parseInt(assessmentForm.Attempt_Limit),
            Status: assessmentForm.Status
         };
         const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
         if (res.ok) {
            showToast(isEdit ? 'Assessment updated' : 'Assessment created');
            await fetchFullCourse();
            setAssessmentForm({ Title: '', Description: '', Total_Mark: 100, Passing_Mark: 40, Duration: 30, Attempt_Limit: 3, Status: 'active', editingId: null });
         } else {
            const err = await res.json();
            let msg = err.detail || err.message || 'Assessment operation failed';
            if (Array.isArray(err.detail)) msg = err.detail.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
            showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
         }
      } catch (err) { showToast('Sync error', 'error'); } finally { setLoading(false); }
   };

   const deleteVideo = async (id) => {
      if (!window.confirm('Delete lesson?')) return;
      const res = await authFetch(`${ADMIN_API}/delete-video/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Lesson removed'); await fetchFullCourse(); refresh(); }
   };

   const deleteLive = async (id) => {
      if (!window.confirm('Delete live session?')) return;
      const res = await authFetch(`${ADMIN_API}/delete-live/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Live session removed'); await fetchFullCourse(); refresh(); }
   };

   const deleteRec = async (id) => {
      if (!window.confirm('Remove recording?')) return;
      const res = await authFetch(`${ADMIN_API}/delete-recorded-video/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Recording removed'); await fetchFullCourse(); }
   };

   const deleteAssessment = async (id) => {
      if (!window.confirm('Erase this assessment and all its contents?')) return;
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
                     <form onSubmit={handleAddOrUpdateModule} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Section title={editingModule ? "Modify Module" : "Add Structure"}>
                           <FormInput label="Title" value={formData.Title} onChange={e => setFormData({ ...formData, Title: e.target.value })} placeholder="e.g. Chapter 1: Introduction" required />
                           {!editingModule && <FormInput label="Position" type="number" value={formData.Position} onChange={e => setFormData({ ...formData, Position: e.target.value })} required />}
                           <FormTextArea label="Overview" value={formData.Course_Description} onChange={e => setFormData({ ...formData, Course_Description: e.target.value })} rows={4} required placeholder="What's this module about?" />
                        </Section>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                           {editingModule && <button type="button" onClick={() => { setEditingModule(null); setFormData({ Title: '', Course_Description: '', Position: modules.length + 1 }); }} style={{ flex: 1, padding: '1.15rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
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
                           <form onSubmit={handleVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                              <Section title={videoForm.editingId ? "Update Lesson" : "Add Recorded Lesson"}>
                                 <FormInput label="Lesson Name" value={videoForm.course_description} onChange={e => setVideoForm({ ...videoForm, course_description: e.target.value })} required />
                                 <FormInput label="Video URL" value={videoForm.Video_URL} onChange={e => setVideoForm({ ...videoForm, Video_URL: e.target.value })} placeholder="Vimeo/YouTube..." required />
                              </Section>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                 {videoForm.editingId && <button type="button" onClick={() => setVideoForm({ Video_URL: '', course_description: '', editingId: null })} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
                                 <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.15rem', borderRadius: '1.25rem', background: '#10b981', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Lesson'}
                                 </button>
                              </div>
                           </form>
                        ) : activeTab === 'live' ? (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              <form onSubmit={handleLiveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                 <Section title="Live Session Schedule">
                                    <FormInput label="Meeting Link" value={liveForm.Meeting_URL} onChange={e => setLiveForm({ ...liveForm, Meeting_URL: e.target.value })} placeholder="https://zoom.us/j/..." required />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>Provider</label>
                                          <select value={liveForm.Provider} onChange={e => setLiveForm({ ...liveForm, Provider: e.target.value })} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
                                             <option value="Zoom">Zoom</option>
                                             <option value="Google Meet">Google Meet</option>
                                             <option value="Microsoft Teams">Teams</option>
                                          </select>
                                       </div>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>Status</label>
                                          <select value={liveForm.Status} onChange={e => setLiveForm({ ...liveForm, Status: e.target.value })} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
                                             <option value="scheduled">Scheduled</option>
                                             <option value="live">Running Now</option>
                                             <option value="completed">Finished</option>
                                          </select>
                                       </div>
                                    </div>
                                    <FormInput label="Starts At" type="datetime-local" value={liveForm.Start_time} onChange={e => setLiveForm({ ...liveForm, Start_time: e.target.value })} required />
                                    <FormInput label="Ends At" type="datetime-local" value={liveForm.End_time} onChange={e => setLiveForm({ ...liveForm, End_time: e.target.value })} required />
                                 </Section>
                                 <div style={{ display: 'flex', gap: '1rem' }}>
                                    {liveForm.editingId && <button type="button" onClick={() => setLiveForm({ Meeting_URL: '', Provider: 'Zoom', Start_time: '', End_time: '', Status: 'scheduled', editingId: null })} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
                                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.15rem', borderRadius: '1.25rem', background: '#3b82f6', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                                       {loading ? <Loader2 size={18} className="animate-spin" /> : 'Schedule Live'}
                                    </button>
                                 </div>
                              </form>

                              {recForm.Live_ID && (
                                 <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '2rem', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'var(--color-text)' }}><Film size={20} /> Attach Session Recording</h3>
                                    <form onSubmit={handleRecSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                       <FormInput label="Recording URL" value={recForm.Rec_Video_URL} onChange={e => setRecForm({ ...recForm, Rec_Video_URL: e.target.value })} required placeholder="Vimeo/YouTube/CDN..." />
                                       <FormInput label="Duration" value={recForm.Duration} onChange={e => setRecForm({ ...recForm, Duration: e.target.value })} placeholder="e.g. 1h 20m" required />
                                       <div style={{ display: 'flex', gap: '1rem' }}>
                                          <button type="button" onClick={() => setRecForm({ Live_ID: null, Rec_Video_URL: '', Duration: '', editingId: null })} style={{ flex: 1, padding: '0.85rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
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
                              <form onSubmit={handleAssessmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                 <Section title={assessmentForm.editingId ? "Modify Assessment" : "New Exam/Quiz"}>
                                    <FormInput label="Title" value={assessmentForm.Title} onChange={e => setAssessmentForm({ ...assessmentForm, Title: e.target.value })} placeholder="e.g. Final Certification Exam" required />
                                    <FormTextArea label="Instructions" value={assessmentForm.Description} onChange={e => setAssessmentForm({ ...assessmentForm, Description: e.target.value })} rows={3} placeholder="Guidelines for students..." />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                       <FormInput label="Total Marks" type="number" value={assessmentForm.Total_Mark} onChange={e => setAssessmentForm({ ...assessmentForm, Total_Mark: e.target.value })} />
                                       <FormInput label="Passing Marks" type="number" value={assessmentForm.Passing_Mark} onChange={e => setAssessmentForm({ ...assessmentForm, Passing_Mark: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                       <FormInput label="Time Limit (Min)" type="number" value={assessmentForm.Duration} onChange={e => setAssessmentForm({ ...assessmentForm, Duration: e.target.value })} />
                                       <FormInput label="Max Attempts" type="number" value={assessmentForm.Attempt_Limit} onChange={e => setAssessmentForm({ ...assessmentForm, Attempt_Limit: e.target.value })} />
                                    </div>
                                 </Section>
                                 <div style={{ display: 'flex', gap: '1rem' }}>
                                    {assessmentForm.editingId && <button type="button" onClick={() => setAssessmentForm({ Title: '', Description: '', Total_Mark: 100, Passing_Mark: 40, Duration: 30, Attempt_Limit: 3, Status: 'active', editingId: null })} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>}
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
                                    <button onClick={() => { setEditingModule(m); setFormData({ Title: m.title, Course_Description: m.description, Position: m.position }); }} style={{ padding: '0.6rem', borderRadius: '0.75rem', border: 'none', background: 'white', color: 'var(--color-text)', cursor: 'pointer' }}><Edit size={16} /></button>
                                    <button onClick={async () => { if (window.confirm('Delete Module?')) { const res = await authFetch(`${ADMIN_API}/delete-module/${m.module_id}`, { method: 'DELETE' }); if (res.ok) { await fetchFullCourse(); refresh(); } } }} style={{ padding: '0.6rem', borderRadius: '0.75rem', border: 'none', background: 'white', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
                                          <button onClick={() => setVideoForm({ Video_URL: v.video_url, course_description: v.course_description, editingId: v.video_id })} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#10b981', cursor: 'pointer' }}><Edit size={14} /></button>
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
                                             <button onClick={() => setLiveForm({ Meeting_URL: l.meeting_url, Provider: l.provider, Start_time: l.start_time.split('.')[0], End_time: l.end_time.split('.')[0], Status: l.status, editingId: l.live_id })} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
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
                                                <button onClick={() => setRecForm({ Live_ID: l.live_id, Rec_Video_URL: l.recorded_videos[0].rec_video_url, Duration: l.recorded_videos[0].duration, editingId: l.recorded_videos[0].rec_video_id })} style={{ border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer' }}><Edit size={12} /></button>
                                                <button onClick={() => deleteRec(l.recorded_videos[0].rec_video_id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                             </div>
                                          </div>
                                       ) : (
                                          l.status === 'completed' && (
                                             <button onClick={() => setRecForm({ Live_ID: l.live_id, Rec_Video_URL: '', Duration: '', editingId: null })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.85rem', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
                                             <button onClick={() => setAssessmentForm({ editingId: a.assessment_id, Title: a.title, Description: a.description, Total_Mark: a.total_mark, Passing_Mark: a.passing_mark, Duration: a.duration, Attempt_Limit: a.attempt_limit, Status: a.status })} style={{ background: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', color: '#fb923c', cursor: 'pointer' }}><Edit size={14} /></button>
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

export const ManageNotesModal = ({ course, onClose, showToast, refresh }) => {
   const { authFetch } = useAuth();
   const [loading, setLoading] = useState(false);
   const [notes, setNotes] = useState(course.notes || []);
   const [editingNote, setEditingNote] = useState(null);

   const [formData, setFormData] = useState({
      Title: '',
      File_URL: '',
      File_Type: 'pdf'
   });

   const handleAddOrUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const isEdit = !!editingNote;
         const url = isEdit
            ? `${ADMIN_API}/update_notes/${editingNote.notes_id}`
            : `${ADMIN_API}/create_notes`;

         const method = isEdit ? 'PUT' : 'POST';
         const body = isEdit
            ? { Title: formData.Title, File_URL: formData.File_URL, File_Type: formData.File_Type }
            : { Course_ID: course.course_id, Title: formData.Title, File_URL: formData.File_URL, File_Type: formData.File_Type };

         const res = await authFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
         });

         if (res.ok) {
            showToast(isEdit ? 'Notes updated' : 'Notes added');
            const detailRes = await authFetch(`${ADMIN_API}/course/${course.course_id}/full-details`);
            if (detailRes.ok) {
               const data = await detailRes.json();
               setNotes(data.course.notes || []);
            }
            setFormData({ Title: '', File_URL: '', File_Type: 'pdf' });
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
      if (!window.confirm('Delete these course notes?')) return;
      try {
         const res = await authFetch(`${ADMIN_API}/delete-notes/${notesId}`, {
            method: 'DELETE'
         });
         if (res.ok) {
            setNotes(notes.filter(n => n.notes_id !== notesId));
            showToast('Notes removed');
            refresh();
         } else {
            showToast('Removal failed', 'error');
         }
      } catch (e) { showToast('Sync error', 'error'); }
   };

   const startEdit = (n) => {
      setEditingNote(n);
      setFormData({
         Title: n.title,
         File_URL: n.file_url,
         File_Type: n.file_type
      });
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
                  <form onSubmit={handleAddOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                     <Section title={editingNote ? "Update Document" : "Register New Resource"}>
                        <FormInput label="Resource Title" value={formData.Title} onChange={e => setFormData({ ...formData, Title: e.target.value })} placeholder="e.g. Course Roadmap PDF" required />
                        <FormInput label="Document URL" value={formData.File_URL} onChange={e => setFormData({ ...formData, File_URL: e.target.value })} placeholder="https://cdn..." required />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                           <label style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>Format</label>
                           <select value={formData.File_Type} onChange={e => setFormData({ ...formData, File_Type: e.target.value })} style={{ backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', padding: '1.15rem' }}>
                              <option value="pdf">Portable Document (PDF)</option>
                              <option value="doc">Word Document</option>
                              <option value="ppt">Presentation</option>
                              <option value="zip">Archive (ZIP)</option>
                              <option value="link">External Link</option>
                           </select>
                        </div>
                     </Section>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        {editingNote && (
                           <button type="button" onClick={() => { setEditingNote(null); setFormData({ Title: '', File_URL: '', File_Type: 'pdf' }); }} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
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