import React, { useState, useEffect } from 'react';
import { 
  Layout, Zap, Clock, Users, BookOpen, Layers, 
  TrendingUp, ArrowUpRight, Plus, Activity,
  ChevronRight, ArrowRight, Shield, Database,
  Calendar, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API } from '../../config';
import { useAuth } from '../../shared/AuthContext';

const StatCard = ({ title, value, icon, color, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="premium-glow-card" 
    style={{ flex: 1, minWidth: '240px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ 
        width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', 
        backgroundColor: `${color}15`, color: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}30`
      }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#10b981', fontSize: '0.65rem', fontWeight: 800 }}>
          <TrendingUp size={12} /> <span>+{trend}%</span>
        </div>
      )}
    </div>
    
    <div>
      <div style={{ 
        fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', 
        letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.35rem' 
      }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.03em' }}>{value}</div>
    </div>
    
    {/* Tech Detail Overlay */}
    <div style={{ 
      position: 'absolute', bottom: '1rem', right: '1.25rem', 
      fontSize: '0.55rem', opacity: 0.2, fontWeight: 950, fontFamily: 'monospace' 
    }}>
      SYS_NODE_{title.substring(0, 3).toUpperCase()}
    </div>
  </motion.div>
);

const QuickAction = ({ label, icon, onClick, sublabel }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', 
      padding: '1.25rem', background: 'var(--color-surface)', 
      border: '1px solid var(--color-border)', borderRadius: '1.25rem', 
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s' 
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--color-primary)';
      e.currentTarget.style.transform = 'translateX(8px)';
      e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--color-border)';
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
    }}
  >
    <div style={{ color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '0.75rem', borderRadius: '1rem' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{sublabel}</div>
    </div>
    <ArrowUpRight size={18} style={{ opacity: 0.3 }} />
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, smartFetch } = useAuth();
  const [stats, setStats] = useState({ courses: 0, students: 0, trainers: 0, assessments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEverything = async () => {
      if (!user) return;
      try {
        const [courseData, tData, statData] = await Promise.all([
          smartFetch(`${ADMIN_API}/courses/ids-by-status`, { cacheKey: 'admin_course_ids' }),
          smartFetch(`${ADMIN_API}/all_trainer`, { cacheKey: 'admin_all_trainers' }),
          smartFetch(`${ADMIN_API}/enrollment-stats`, { cacheKey: 'admin_enrollment_stats' })
        ]);
        
        let courseCount = 0;
        let trainerCount = 0;
        let studentCount = 0;
        
        if (courseData) {
          const { active, draft, inactive } = courseData.courses || {};
          courseCount = [...(active || []), ...(draft || []), ...(inactive || [])].length;
        }
        
        if (tData) {
          trainerCount = (tData.active_trainer_email?.length || 0) + (tData.inactive_trainer_email?.length || 0);
        }

        if (statData && statData.data) {
          studentCount = statData.data.reduce((sum, course) => sum + (course.enrolled_students || 0), 0);
        }

        setStats({ courses: courseCount, trainers: trainerCount, students: studentCount, assessments: 12 }); // Hardcoded 12 for now or fetch
      } catch (err) {
        console.error("Dashboard sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEverything();
  }, [user, smartFetch]);

  return (
    <div style={{ padding: 'var(--page-padding)', maxWidth: '1600px', margin: '0 auto' }} className="animate-fade-in">
      
      {/* HEADER COMMAND SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10 items-start" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            <Activity size={12} />
            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Real-time Operations</span>
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>System Overview</h2>
          <p style={{ margin: 0, maxWidth: '450px', fontSize: '0.8rem' }}>
            Manage core telemetry data, course structures, and ecosystem participants from the central node.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ 
            background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
            padding: '0.75rem 1.25rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' 
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>LIVE INSTANCE</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>V2.4.0_STABLE</div>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard title="Total Courses" value={stats.courses} icon={<BookOpen size={20} />} color="#10b981" delay={0.1} />
        <StatCard title="Active Learners" value={stats.students} icon={<Users size={20} />} color="#3b82f6" delay={0.2} />
        <StatCard title="Total Trainers" value={stats.trainers} icon={<Database size={20} />} color="#f59e0b" delay={0.3} />
        <StatCard title="Assessments" value={stats.assessments} icon={<Award size={20} />} color="#8b5cf6" delay={0.4} />
      </div>

      {/* MAIN LAYOUT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: ARCADE CONTAINER */}
        <div className="arcade-container" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Active Evolution Node</h3>
            <button 
              onClick={() => navigate('/admin/courses')}
              className="btn" 
              style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', fontSize: '0.8rem', border: '1px solid var(--color-border)' }}
            >
              Expansion Protocol <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                 <Activity className="animate-spin" style={{ marginBottom: '1rem' }} />
                 <p style={{ fontWeight: 950, fontSize: '0.7rem', letterSpacing: '0.1em' }}>SCANNING ECOSYSTEM...</p>
              </div>
            ) : stats.courses === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                 <Layers size={40} style={{ marginBottom: '1rem' }} />
                 <p style={{ fontWeight: 950, fontSize: '0.7rem', letterSpacing: '0.1em' }}>NO ACTIVE NODES DETECTED</p>
              </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                   Synchronized with core registry. {stats.courses} course nodes verified active.
                 </p>
                 <button 
                   onClick={() => navigate('/admin/courses')}
                   className="btn btn-primary" 
                   style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', borderRadius: '1rem' }}
                 >
                   Manage Inventory
                 </button>
               </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & UTILITIES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="premium-glow-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} /> Command Center
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <QuickAction 
                label="Launch New Course" 
                sublabel="Course Construction Protocol"
                icon={<Plus size={18} />} 
                onClick={() => navigate('/admin/courses')} 
              />
              <QuickAction 
                label="Onboard Trainer" 
                sublabel="Human Resource Integration"
                icon={<Users size={18} />} 
                onClick={() => navigate('/admin/users')} 
              />
              <QuickAction 
                label="Sync Assessments" 
                sublabel="Curriculum Validation"
                icon={<Activity size={18} />} 
                onClick={() => navigate('/admin/assessments')} 
              />
            </div>
          </div>


        </div>

      </div>

      <style>{`
        h1 { margin-bottom: 0.5rem; letter-spacing: -0.05em; font-weight: 950; }
        .grid { display: grid; }
        @media (max-width: 1000px) {
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
