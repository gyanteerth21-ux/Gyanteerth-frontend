import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { Book, Users, Video, Clock, Activity, ArrowRight, Calendar, Shield, BookOpen, Award, CalendarDays, ExternalLink, Zap, Layers, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ADMIN_API, TRAINER_API } from '../../config';

const CACHE_KEY = 'trainer_dashboard_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/* ── Premium Stat Card ── */
const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem',
      background: 'white', borderRadius: '1.5rem', border: '1px solid #f1f5f9',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flex: 1, minWidth: '220px'
    }}
  >
    <div style={{ 
      width: '3.5rem', height: '3.5rem', borderRadius: '1rem', 
      backgroundColor: `${color}15`, color: color, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>{title}</div>
    </div>
  </motion.div>
);

/* ── Skeleton Loader ── */
const DashboardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '100px', background: '#f1f5f9', borderRadius: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out' }} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
      <div style={{ height: '400px', background: '#f1f5f9', borderRadius: '2rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ height: '180px', background: '#f1f5f9', borderRadius: '2rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: '200px', background: '#f1f5f9', borderRadius: '2rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
    </div>
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
  </div>
);

const TrainerDashboard = () => {
  const { user, smartFetch } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState({ courses: [], students: [], liveSessions: [] });
  const [loading, setLoading] = useState(true);

  const fetchTrainerData = useCallback(async () => {
    const identifier = user?.user_id || user?.id || user?.email;
    if (!identifier) return;

    try {
      // 1. Fetch Course IDs securely (SWR enabled)
      const cachedIds = await smartFetch(`${TRAINER_API}/trainer_course_ids`, {
        cacheKey: `trainer_course_ids_${identifier}`
      });
      const ids = cachedIds?.course_ids || [];

      // 3. CONCURRENT BATCH FETCHING
      const coursePromises = ids.map(async (id) => {
        const [detailJson, pData] = await Promise.all([
          smartFetch(`${ADMIN_API}/course/${id}/full-details`, { cacheKey: `details_${id}` }),
          smartFetch(`${TRAINER_API}/course/${id}/students-progress`, { cacheKey: `st_prog_${id}` })
        ]);

        let courseData = { course_id: id, course_title: `Course ${id}`, progress: 0, studentCount: 0, type: 'recorded', is_active: false, studentsList: [], liveSessions: [] };

        if (detailJson) {
          const c = detailJson.course || detailJson;
          courseData = {
            ...courseData, ...c,
            course_title: c.course_title || c.title,
            type: (c.course_type || c.course_Type || c.type || 'recorded').toLowerCase(),
            is_active: !!c.is_active
          };

          // ✅ Extract live sessions
          const allModuleSessions = (c.modules || []).flatMap(m =>
            (m.content?.live_sessions || m.live_sessions || []).map(ls => ({
              ...ls,
              live_id: ls.live_id || ls.Live_ID,
              course_id: id,
              course_title: courseData.course_title,
              title: ls.title || ls.Title,
              meeting_url: ls.meeting_url || ls.Meeting_URL,
              start_time: ls.start_time || ls.Start_time,
              end_time: ls.end_time || ls.End_time,
              status: ls.status || ls.Status || 'scheduled',
              provider: ls.provider || ls.Provider
            }))
          );
          courseData.liveSessions = allModuleSessions;
        }

        if (pData) {
          const studentsList = pData.data || [];
          courseData.studentCount = studentsList.length;
          courseData.studentsList = studentsList.map(st => ({
             name: st.user_name,
             email: st.email || st.user_id,
             progress: st.progress_percentage || 0,
             course_title: courseData.course_title,
             course_id: id
          }));
          if (studentsList.length > 0) {
            const totalProgress = studentsList.reduce((sum, s) => sum + (s.progress_percentage || 0), 0);
            courseData.progress = Math.round(totalProgress / studentsList.length);
          }
        }
        return courseData;
      });

      // 4. Await all course processing
      const coursesResult = await Promise.all(coursePromises);

      // 5. Extract ALL enrollments (No deduplication, as per user request to see 'both')
      let allEnrollments = [];
      coursesResult.forEach(c => { allEnrollments = [...allEnrollments, ...(c.studentsList || [])]; });
      
      const finalStudents = allEnrollments.sort((a, b) => b.progress - a.progress);

      // 6. Aggregate ALL live sessions from course modules (Both Previous and Current)
      const allLive = coursesResult
        .flatMap(c => c.liveSessions || [])
        .sort((a, b) => {
          // Sort order: 1. Live Now, 2. Upcoming (Soonest first), 3. Past (Latest first)
          const isALive = a.status === 'live';
          const isBLive = b.status === 'live';
          if (isALive && !isBLive) return -1;
          if (!isALive && isBLive) return 1;
          
          const now = new Date();
          const aTime = new Date(a.start_time);
          const bTime = new Date(b.start_time);
          
          const isAUpcoming = aTime > now;
          const isBUpcoming = bTime > now;
          
          if (isAUpcoming && isBUpcoming) return aTime - bTime; // Soonest upcoming first
          if (!isAUpcoming && !isBUpcoming) return bTime - aTime; // Newest past first
          
          return isAUpcoming ? -1 : 1; // Upcoming before past
        });

      const payload = {
        courses: coursesResult,
        students: finalStudents,
        liveSessions: allLive
      };

      setData(payload);
    } catch (err) {
      console.error("Dashboard sync failure", err);
    } finally {
      setLoading(false);
    }
  }, [user, smartFetch]);

  useEffect(() => { fetchTrainerData(); }, [fetchTrainerData]);

  const { courses, students, liveSessions } = data;
  const avgOverallProgress = courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* ── Command Center Hero ── */}
      <div className="p-6 md:p-14 mb-8 md:mb-10" style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', 
        borderRadius: '2.5rem',
        position: 'relative', overflow: 'hidden', color: 'white',
        boxShadow: '0 25px 50px -12px rgba(30, 27, 75, 0.25)'
      }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.4rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <Shield size={14} color="#818cf8" /> Instructor Console
            </div>
            <h1 className="text-2xl md:text-5xl" style={{ fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
              Welcome back, <span style={{ color: '#818cf8' }}>Professor {user?.name?.split(' ')[0] || 'Trainer'}</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6 }}>
              Overview of your active knowledge nodes, upcoming broadcasts, and student interaction metrics.
            </p>
          </div>
          
          {/* Quick Actions inside Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
             <button onClick={() => navigate('/trainer/courses')} style={{ background: 'white', color: '#1e1b4b', border: 'none', padding: '1rem 1.5rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <Book size={18} color="#4f46e5" /> Course Repository <ArrowRight size={16} style={{ marginLeft: 'auto' }}/>
             </button>
             <button onClick={() => navigate('/trainer/live-sessions')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 1.5rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                <CalendarDays size={18} color="#a5b4fc" /> Broadcast Schedule
             </button>
          </div>
        </div>
      </div>

      {loading ? <DashboardSkeleton /> : (
        <>
          {/* METRICS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <StatCard title="Assigned Modules" value={courses.length} icon={<Layers />} color="#4f46e5" delay={0.0} />
            <StatCard title="Total Students" value={students.length} icon={<Users />} color="#0ea5e9" delay={0.1} />
            <StatCard title="Upcoming Lives" value={liveSessions.length} icon={<Video />} color="#10b981" delay={0.2} />
            <StatCard title="Avg Engagement" value={`${avgOverallProgress}%`} icon={<Activity />} color="#f59e0b" delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10 items-start">
            
            {/* LEFT COLUMN: ASSIGNED COURSES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Active Modules</h3>
                <button onClick={() => navigate('/trainer/courses')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>View All <ChevronRight size={16} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {courses.length === 0 && (
                  <div style={{ padding: '4rem 2rem', background: 'white', borderRadius: '2rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <BookOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>No assigned modules</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>You have not been assigned any courses yet.</p>
                  </div>
                )}
                {courses.slice(0, 4).map((course, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    key={course.course_id} 
                    style={{ padding: '1.5rem', background: 'white', borderRadius: '2rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                       <div style={{ width: '80px', height: '60px', borderRadius: '1rem', background: '#0f172a', overflow: 'hidden', flexShrink: 0 }}>
                         <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Course Thumbnail" />
                       </div>
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.course_title}</h4>
                         <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={14} color="#4f46e5" /> {course.studentCount} Enrolled</span>
                           <span>•</span>
                           <span style={{ 
                             padding: '0.15rem 0.65rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800,
                             background: (course.type === 'live' || course.type === 'live_course') ? '#fef2f2' : '#f0fdf4',
                             color: (course.type === 'live' || course.type === 'live_course') ? '#ef4444' : '#10b981',
                             border: `1px solid ${(course.type === 'live' || course.type === 'live_course') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                           }}>
                             {(course.type === 'live' || course.type === 'live_course') ? '🔴 Live' : '🟢 Recorded'}
                           </span>
                         </div>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem' }}>
                       <div style={{ flex: 1, background: '#e2e8f0', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                         <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress || 0}%` }} transition={{ duration: 1 }} style={{ width: `${course.progress || 0}%`, background: 'linear-gradient(90deg, #4f46e5, #818cf8)', height: '100%', borderRadius: '10px' }} />
                       </div>
                       <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#4f46e5' }}>{course.progress || 0}% Avg</span>
                       <button onClick={() => navigate(`/trainer/course/${course.course_id}`)} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>Review</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE SESSIONS & STUDENTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* UPCOMING LIVE SESSIONS */}
                <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <Video size={20} style={{ color: '#ef4444' }} />
                         <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Live Sessions</h3>
                       </div>
                    </div>
                    
                    {liveSessions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '1.25rem', border: '1px dashed #e2e8f0' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>No upcoming broadcasts.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         {liveSessions.slice(0, 3).map((session, i) => (
                           <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={session.live_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
                              <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>{session.title || 'Live Broadcast'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 800 }}>
                                  {session.status === 'live' ? '🟢 HAPPENING NOW' : new Date(session.start_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <a href={session.meeting_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: session.status === 'live' ? '#ef4444' : '#4f46e5', color: 'white' }}>
                                <ExternalLink size={16} />
                              </a>
                           </motion.div>
                         ))}
                      </div>
                    )}
                </div>

                {/* RECENT STUDENTS */}
                <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={20} style={{ color: '#0ea5e9' }} />
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Top Students</h3>
                       </div>
                       <button onClick={() => navigate('/trainer/students')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>Roster</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {students.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>Awaiting student enrollments...</p>
                      ) : (
                        students.slice(0, 6).map((student, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.1 }} 
                            key={`${student.email}-${student.course_id}`} 
                            style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
                          >
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900 }}>
                              {(student.name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.name || 'Anonymous'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.course_title}</div>
                            </div>
                            <div style={{ background: '#f0fdf4', color: '#10b981', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
                              {student.progress}%
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerDashboard;