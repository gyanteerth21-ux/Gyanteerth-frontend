import { useMemo } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { useTheme } from '../../shared/ThemeContext';
import { useEnrollment } from '../../shared/EnrollmentContext';
import { BookOpen, Award, Clock, PlayCircle, ChevronRight, Zap, Video, ArrowRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LiveSessionTracker from '../../components/student/LiveSessionTracker';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { enrolledCourses, getCourseProgress } = useEnrollment();

  // Memoize calculations to prevent performance hits on re-renders
  const { enrolledWithProgress, totalCompleted, inProgress } = useMemo(() => {
    const rawCourses = enrolledCourses || [];

    const mapped = rawCourses.map(c => ({
      ...c,
      currentProgress: c.progress || 0
    }));

    // Smart Sorting: Active/Ongoing courses (1-99%) first, then Not Started (0%), then Completed (100%)
    const sorted = [...mapped].sort((a, b) => {
      const aDone = a.currentProgress === 100;
      const bDone = b.currentProgress === 100;
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return b.currentProgress - a.currentProgress;
    });

    const completed = mapped.filter(c => c.currentProgress === 100).length;
    const ongoing = mapped.filter(c => (c.currentProgress || 0) < 100).length;

    return { enrolledWithProgress: sorted, totalCompleted: completed, inProgress: ongoing };
  }, [enrolledCourses]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>

      {/* ── Welcome Hero ── */}
      <div className="p-6 md:p-14 mb-8 md:mb-12" style={{
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        borderRadius: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        boxShadow: '0 25px 50px -12px rgba(6, 95, 70, 0.25)'
      }}>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="w-full md:w-auto">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.4rem 1rem', borderRadius: '1rem', fontSize: '0.7rem md:fontSize:0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem md:marginBottom:1.5rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <Zap size={12} fill="#fbbf24" color="#fbbf24" /> Success Focused
            </div>

            <div className="flex items-center gap-3 md:gap-5 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-2 md:border-3 border-white/30 overflow-hidden flex items-center justify-center text-emerald-800 flex-shrink-0">
                {user?.pic ? (
                  <img src={user.pic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl md:text-2xl font-black">{(user?.firstName || user?.name || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h1 className="text-xl md:text-5xl font-black leading-tight tracking-tight text-white">
                Welcome back, <span className="text-amber-400">{user?.firstName || user?.name?.split(' ')[0] || 'Learner'}</span>! 👋
              </h1>
            </div>

            <p className="text-base md:text-xl font-medium opacity-90 max-w-[550px] leading-relaxed">
              You're making great progress. Continue your learning journey and unlock new professional opportunities.
            </p>

            <div className="mt-8 md:mt-10">
              <button
                onClick={() => navigate('/student/courses')}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-8 md:px-10 py-4 md:py-4.5 rounded-2xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3"
              >
                Resume Learning <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-[1.5rem] p-4 md:p-6 border border-white/10 text-center min-w-[120px] md:min-w-[140px]">
              <div className="text-2xl md:text-4xl font-black text-amber-400">{totalCompleted}</div>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-70">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-[1.5rem] p-4 md:p-6 border border-white/10 text-center min-w-[120px] md:min-w-[140px]">
              <div className="text-2xl md:text-4xl font-black text-white">{inProgress}</div>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-70">Ongoing</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-10">

        {/* Left Column: Learning Continuity */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? 'white' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <PlayCircle size={26} color="#f97316" /> Pick up where you left off
            </h2>
            <Link to="/student/courses" style={{ fontSize: '0.9rem', color: isDark ? '#34d399' : '#059669', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#047857'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#34d399' : '#059669'}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {enrolledWithProgress.length === 0 ? (
              <div style={{ padding: '4rem 2rem', background: 'white', borderRadius: '2rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                <BookOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>No active enrollments</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Explore our catalog to start your learning journey.</p>
                <button onClick={() => navigate('/student/browse')} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#059669', color: 'white', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#047857'} onMouseLeave={e => e.currentTarget.style.background = '#059669'}>Browse Courses</button>
              </div>
            ) : (
              enrolledWithProgress.slice(0, 3).map((course, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={course.course_id || course.id}
                  onClick={() => navigate(`/student/course/${course.id || course.course_id}`)}
                  style={{
                    padding: '1.5rem', 
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'white', 
                    borderRadius: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem',
                    cursor: 'pointer', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
                    boxShadow: isDark ? 'none' : '0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-4px)'; 
                    e.currentTarget.style.borderColor = isDark ? '#10b98144' : '#10b98122'; 
                    e.currentTarget.style.boxShadow = isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 20px 40px -10px rgba(0,0,0,0.15)'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'none'; 
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'; 
                    e.currentTarget.style.boxShadow = isDark ? 'none' : '0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)'; 
                  }}
                >
                  <div className="w-16 h-10 md:w-[100px] md:h-[65px] rounded-lg md:rounded-2xl bg-slate-900 overflow-hidden flex-shrink-0">
                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} loading="lazy" className="w-full h-full object-cover" alt="Course Thumbnail" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: isDark ? 'white' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title || 'Course Module'}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.75rem' }}>
                      <div style={{ flex: 1, background: '#f1f5f9', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${course.currentProgress || 0}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ width: `${course.currentProgress || 0}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', height: '100%', borderRadius: '10px' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#10b981' }}>{course.currentProgress || 0}%</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-orange-500 flex-shrink-0">
                    <ArrowRight size={18} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Community & Support */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Live Session Tracker Section */}
          <LiveSessionTracker limit={3} />

          {/* Stunning Achievement Card */}
          <div style={{ 
            background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'white', 
            borderRadius: '2.5rem', 
            padding: '2.5rem', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
            boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 20px 40px -15px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background element */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: isDark ? 'white' : '#0f172a', margin: 0 }}>Achievements</h3>
                <div style={{ padding: '0.4rem 0.8rem', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Verified
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '1.5rem', 
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                  padding: '1.5rem', borderRadius: '2rem',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'transparent'}`
                }}>
                  <div style={{ 
                    width: '60px', height: '60px', 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 20px rgba(245, 158, 11, 0.3)'
                  }}>
                    <Award size={28} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Digital Certificates</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 950, color: isDark ? 'white' : '#0f172a', lineHeight: 1 }}>
                      {totalCompleted} <span style={{ fontSize: '1rem', color: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1', fontWeight: 700 }}>Earned</span>
                    </div>
                  </div>
                </div>

                <Link to="/student/certificates" style={{ 
                  display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '0.75rem',
                  width: '100%', padding: '1.1rem', borderRadius: '1.25rem',
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#0f172a',
                  color: 'white', fontWeight: 800, fontSize: '0.9rem',
                  textDecoration: 'none', transition: 'all 0.2s', textAlign: 'center',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    View All Certificates <ChevronRight size={18} />
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

export default Dashboard;