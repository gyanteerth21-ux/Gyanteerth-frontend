import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { Book, Loader2, Search, BookOpen, PlayCircle, Users, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ADMIN_API, TRAINER_API } from '../../config';

const TrainerCourses = () => {
  const { user, smartFetch } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Skeleton Loader ── */
  const CourseGridSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ height: '380px', background: '#f1f5f9', borderRadius: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );

  const fetchTrainerCourses = useCallback(async () => {
    const identifier = user?.user_id || user?.id || user?.email;
    if (!identifier) return;
    
    try {
      // 1. Fetch Course IDs securely (SWR enabled)
      const data = await smartFetch(`${TRAINER_API}/trainer_course_ids`, {
         cacheKey: `trainer_course_ids_${identifier}`
      });
      const ids = data?.course_ids || [];

      // 3. CONCURRENT BATCH FETCHING (Eliminates the N+1 loop)
      const coursePromises = ids.map(async (id) => {
        const [detailJson, pData] = await Promise.all([
          smartFetch(`${ADMIN_API}/course/${id}/full-details`, { cacheKey: `details_${id}` }),
          smartFetch(`${TRAINER_API}/course/${id}/students-progress`, { cacheKey: `st_prog_${id}` })
        ]);

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

      const fetchedCourses = await Promise.all(coursePromises);
      
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Dashboard sync failure", err);
    } finally {
      setLoading(false);
    }
  }, [user, smartFetch]);

  useEffect(() => { fetchTrainerCourses(); }, [fetchTrainerCourses]);

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
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Course Repository
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>
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
              style={{ width: '320px', padding: '0.85rem 1rem 0.85rem 3rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '1.25rem', fontSize: '0.95rem', fontWeight: 600, outline: 'none', color: '#0f172a', transition: 'border-color 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} 
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
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
              style={{ padding: '6rem 2rem', textAlign: 'center', background: 'white', borderRadius: '2rem', border: '2px dashed #e2e8f0' }}
            >
              <BookOpen size={56} color="#cbd5e1" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>No courses found</h3>
              <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem' }}>Try adjusting your search terms or wait for new assignments.</p>
            </motion.div>
          ) : (
            <motion.div 
              layout 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}
            >
              {filteredCourses.map((course, index) => {
                const typeStyle = getTypeColor(course.course_type || course.type);
                return (
                  <motion.div 
                    key={course.course_id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    style={{ 
                      display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', 
                      backgroundColor: 'white', border: '1px solid #f1f5f9', overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: '180px', position: 'relative', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                      <img 
                        src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80`} 
                        alt={course.course_title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                      
                      <div style={{
                        position: 'absolute', top: '16px', left: '16px',
                        background: typeStyle.bg, color: typeStyle.text,
                        padding: '0.35rem 0.85rem', borderRadius: '2rem',
                        fontSize: '0.7rem', fontWeight: 900, backdropFilter: 'blur(8px)',
                        border: `1px solid ${typeStyle.text}30`, textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {typeStyle.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.course_title}
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', alignItems: 'center', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Users size={16} color="#4f46e5" /> {course.studentCount} Students
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <BarChart2 size={16} color="#10b981" /> {course.level || 'Intermediate'}
                        </span>
                      </div>

                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>Avg. Engagement</span>
                          <span style={{ fontWeight: 800, color: '#4f46e5' }}>{course.avgProgress}%</span>
                        </div>
                        <div style={{ width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '99px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${course.avgProgress}%` }} transition={{ duration: 1 }} style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8)', height: '100%', borderRadius: '99px' }} />
                        </div>

                        <button 
                          onClick={() => navigate(`/trainer/course/${course.course_id}`)}
                          style={{ width: '100%', padding: '0.9rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                          <PlayCircle size={18} /> View Content
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default TrainerCourses;