import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, BarChart2, PlayCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ADMIN_API, TRAINER_API, optimizeImageUrl } from '../../config';
import TrainerCourseCard from '../../components/trainer/TrainerCourseCard';

const TrainerCourses = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const identifier = user?.user_id || user?.id || user?.email;
  
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Skeleton Loader ── */
  const CourseGridSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ height: '380px', background: 'var(--color-border)', borderRadius: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['trainer_courses', identifier],
    queryFn: async () => {
      const dataRes = await authFetch(`${TRAINER_API}/trainer_course_ids`);
      if (!dataRes.ok) throw new Error("Failed to fetch course ids");
      const data = await dataRes.json();
      const ids = data?.course_ids || [];

      const coursePromises = ids.map(async (id) => {
        const [detRes, pRes] = await Promise.all([
          authFetch(`${ADMIN_API}/course/${id}/full-details`),
          authFetch(`${TRAINER_API}/course/${id}/students-progress`)
        ]);
        
        const detailJson = detRes.ok ? await detRes.json() : null;
        const pData = pRes.ok ? await pRes.json() : null;

        let courseData = { 
          course_id: id, 
          course_title: `Course ID: ${id}`, 
          course_description: 'No description available', 
          is_active: false, 
          avgProgress: 0, 
          studentCount: 0,
          type: 'recorded'
        };

        if (detailJson) {
           const c = detailJson.course || detailJson;
           courseData = { 
             ...courseData, 
             ...c,
             course_title: c.course_title || c.title || courseData.course_title,
             course_description: c.course_description || c.description || courseData.course_description,
             is_active: c.is_active || true,
             type: (c.course_type || c.course_Type || c.type || 'recorded').toLowerCase()
           };
        }

        if (pData) {
          const studentsList = pData.data || [];
          courseData.studentCount = studentsList.length;
          
          if (studentsList.length > 0) {
            const totalProgress = studentsList.reduce((sum, s) => sum + (s.progress_percentage || 0), 0);
            courseData.avgProgress = Math.round(totalProgress / studentsList.length);
          }
        }
        return courseData;
      });

      return Promise.all(coursePromises);
    },
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Memoize filtering to prevent CPU spikes when typing
  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      (course.course_title || '').toLowerCase().includes(query) ||
      (course.course_description || '').toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  const getTypeColor = (type) => {
    if (!type) return { bg: '#f8f7ff', text: '#6366f1', label: 'Recorded' };
    const t = type.toLowerCase();
    if (t === 'live' || t === 'live_course' || t === 'live session') return { bg: '#fef2f2', text: '#ef4444', label: 'Live' };
    return { bg: '#f0fdf4', text: '#10b981', label: 'Recorded' };
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingBottom: '6rem' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Course Repository
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
            Management interface for your assigned knowledge nodes and student delivery metrics.
          </p>
        </div>
        
        <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{ width: '320px', padding: '0.85rem 1rem 0.85rem 3rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.95rem', fontWeight: 600, outline: 'none', color: 'var(--color-text)', transition: 'border-color 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} 
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border-strong)'}
            />
        </div>
      </div>

      {loading ? (
        <CourseGridSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '2rem', border: '2px dashed #e2e8f0' }}
            >
              <BookOpen size={56} color="#cbd5e1" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>No courses found</h3>
              <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem' }}>Try adjusting your search terms or wait for new assignments.</p>
            </motion.div>
          ) : (
            <motion.div 
              layout 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}
            >
              {filteredCourses.map((course, index) => (
                <motion.div 
                  key={course.course_id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <TrainerCourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default TrainerCourses;