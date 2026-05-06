import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, Clock, Loader2,
  Award, X, CheckCircle,
  Zap, Video, Layers, ArrowRight
} from 'lucide-react';
import { useEnrollment } from '../../shared/EnrollmentContext';
import { useAuth } from '../../shared/AuthContext';
import { useTheme } from '../../shared/ThemeContext';
import { ADMIN_API } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_KEY = 'lms_catalog_cache_v2';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/* ── Skeleton Loader ── */
const CourseSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '2.5rem', overflow: 'hidden', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '420px' }}>
    <div style={{ height: '200px', background: '#e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ height: '20px', width: '30%', background: '#f1f5f9', borderRadius: '1rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ height: '28px', width: '90%', background: '#f1f5f9', borderRadius: '0.5rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ height: '28px', width: '60%', background: '#f1f5f9', borderRadius: '0.5rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1.5px solid #f8fafc' }}>
        <div style={{ height: '30px', width: '40%', background: '#f1f5f9', borderRadius: '0.5rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: '40px', width: '30%', background: '#f1f5f9', borderRadius: '1.25rem', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
    </div>
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
  </div>
);

/* ── Enrollment Confirmation Modal ── */
function EnrollModal({ course, onConfirm, onCancel }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const typeLower = (course?.type || course?.course_type || course?.course_Type || 'recorded').toLowerCase();
  const isLive = typeLower === 'live' || typeLower === 'live_course' || typeLower === 'live session';

  const formatPrice = () => {
    if (!course) return 'Free';
    if (course.price?.discount !== undefined && course.price?.discount !== null) return `₹${course.price.discount}`;
    if (course.price?.original) return `₹${course.price.original}`;
    return 'Free';
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Optimized Backdrop */}
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(5px)', willChange: 'transform' }} />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: '2.5rem', width: 'min(95vw, 500px)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', padding: '1.75rem 1.5rem md:padding:2.5rem 2rem', position: 'relative', color: 'white' }}>
          <button onClick={onCancel} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.7rem', borderRadius: '2rem', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{isLive ? '🔴 Live Program' : '🎬 Pro Course'}</div>
          <h2 style={{ fontSize: '1.25rem md:fontSize:1.5rem', fontWeight: 900, lineHeight: 1.3, margin: 0 }}>{course.title}</h2>
        </div>

        <div style={{ padding: '1.25rem md:padding:2rem' }}>
          <div style={{ background: '#f8fafc', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#059669', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Inclusions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { icon: <Layers size={14} color="#059669" />, text: 'Full curriculum access' },
                { icon: <Video size={14} color="#059669" />, text: isLive ? 'Live interactive sessions' : 'Recorded masterclasses' },
                { icon: <Award size={14} color="#059669" />, text: 'Industry recognized certificate' },
                { icon: <Zap size={14} color="#059669" />, text: 'Lifetime platform access' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>{item.icon} {item.text}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem md:fontSize:1.75rem', fontWeight: 900, color: '#0f172a' }}>{formatPrice()}</div>
              {course.price?.original && <div style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{course.price.original}</div>}
            </div>
            <div style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '0.8rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{course.level || 'Advanced'}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={onConfirm} style={{ width: '100%', background: '#f97316', color: 'white', border: 'none', borderRadius: '1rem', padding: '1rem', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 8px 20px rgba(249, 115, 22, 0.25)' }}>Confirm Enrollment <ArrowRight size={18} /></button>
            <button onClick={onCancel} style={{ width: '100%', background: 'white', color: '#64748b', border: '1.5px solid #f1f5f9', borderRadius: '1rem', padding: '0.85rem', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>I'll decide later</button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/* ── Success Toast ── */
function SuccessToast({ courseName, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, background: 'white', borderRadius: '1.5rem', padding: '1.25rem 2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '400px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={22} color="#10b981" /></div>
      <div>
        <div style={{ fontWeight: 900, color: '#065f46', fontSize: '1rem' }}>Success! 🎉</div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Enrolled in {courseName}</div>
      </div>
    </motion.div>
  );
}

const Catalog = () => {
  const navigate = useNavigate();
  const { enroll, isEnrolled } = useEnrollment();
  const { user, authFetch } = useAuth();
  const { isDark } = useTheme();

  const [activeCategory, setActiveCategory] = useState('All');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [toast, setToast] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!user) return;

      // 1. Check Local Cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setCategories(data.categories);
          setCourses(data.courses);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      
      try {
        const [catRes, statusRes] = await Promise.all([
          authFetch(`${ADMIN_API}/get-categories`),
          authFetch(`${ADMIN_API}/courses/ids-by-status`)
        ]);

        let finalCategories = ['All'];
        let rawCats = [];
        if (catRes.ok) {
          const catData = await catRes.json();
          rawCats = catData.categories || catData.data || catData || [];
          const names = rawCats.map(c => c.Category_Name || c.name || c.category_name || c.Title || 'Other');
          finalCategories = ['All', ...new Set(names.filter(Boolean))];
          setCategories(finalCategories);
        }

        let finalCourses = [];
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const activeIds = statusData.courses?.active || [];
          
          const courseDetails = await Promise.all(activeIds.map(async (id) => {
            try {
              const res = await authFetch(`${ADMIN_API}/course/${id}/full-details`);
              if (res.ok) {
                const data = await res.json();
                const c = data.course || data.data || data;
                
                // Enhanced Category Mapping
                let catName = c.category_name || c.Category_Name || c.Category;
                if (!catName && (c.category_id || c.Category_ID || c.Course_Category_ID)) {
                  const cid = c.category_id || c.Category_ID || c.Course_Category_ID;
                  const match = rawCats.find(rc => (rc.Category_ID || rc.id || rc.Category_id) === cid);
                  if (match) catName = match.Category_Name || match.name || match.category_name || match.Title;
                }

                return {
                  ...c,
                  id: c.course_id || c.Course_id || c.Course_ID || id,
                  title: c.course_title || c.title || c.Course_Title || 'Untitled',
                  thumbnail: c.thumbnail || c.Thumbnail || c.course_thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                  category_name: catName || 'Mastery',
                  type: (c.course_type || c.course_Type || c.Course_Type || c.type || 'recorded').toLowerCase(),
                  level: c.level || c.Level || 'Intermediate'
                };
              }
            } catch (e) { console.error(`Failed to fetch details for ${id}`, e); }
            return null;
          }));
          
          finalCourses = courseDetails.filter(Boolean);
          setCourses(finalCourses);
        }

        // Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: { categories: finalCategories, courses: finalCourses }
        }));

      } catch (err) { 
        console.error("Catalog sync error", err); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchCatalog();
  }, [user, authFetch]);

  // Memoize filtering for performance
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      // 1. Filter out already enrolled courses
      if (isEnrolled(c.id)) return false;

      const normalize = (s) => (s || '').trim().toLowerCase();
      const matCat = activeCategory === 'All' || normalize(c.category_name) === normalize(activeCategory);
      const matSch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matCat && matSch;
    });
  }, [courses, activeCategory, searchQuery, isEnrolled]);

  const handleEnrollClick = (e, course) => {
    e?.stopPropagation();
    if (isEnrolled(course.id)) { navigate(`/student/course/${course.id}`); return; }
    setEnrollingCourse(course);
  };

  const handleConfirmEnroll = () => {
    if (!enrollingCourse) return;
    enroll(enrollingCourse);
    const { title, id } = enrollingCourse;
    setEnrollingCourse(null);
    setToast(title);
    setTimeout(() => navigate(`/student/course/${id}`), 1000);
  };

  const getStatusStyle = (type) => {
    const t = type.toLowerCase();
    const isL = t === 'live' || t === 'live_course' || t === 'live session';
    return { bg: isL ? '#fee2e2' : '#f0fdf4', color: isL ? '#ef4444' : '#10b981', label: isL ? 'LIVE' : 'RECORDED' };
  };

  const formatPrice = (course) => {
    if (!course?.price) return 'Free';
    const disc = course.price?.discount !== undefined ? course.price.discount : course.price.discount_price;
    if (disc !== undefined && disc !== null) return `₹${disc}`;
    if (course.price?.original) return `₹${course.price.original}`;
    return 'Free';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <AnimatePresence>
        {enrollingCourse && <EnrollModal course={enrollingCourse} onConfirm={handleConfirmEnroll} onCancel={() => setEnrollingCourse(null)} />}
        {toast && <SuccessToast courseName={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-8">
        <div>
          <h1 className="text-xl md:text-3xl" style={{ fontWeight: 950, color: isDark ? 'white' : '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            Elevate Your <span style={{ color: '#059669' }}>Horizon</span> 🚀
          </h1>
          <p className="text-xs md:text-sm" style={{ color: isDark ? '#64748b' : '#64748b', fontWeight: 600, maxWidth: '500px' }}>
            Expert programs tailored for your professional growth.
          </p>
        </div>
        <div className="relative w-full md:w-[280px]">
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '0.7rem 0.8rem 0.7rem 2.75rem', 
              borderRadius: '1rem', 
              border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
              background: isDark ? '#1e293b' : 'white', 
              color: isDark ? 'white' : '#0f172a',
              fontSize: '0.85rem', 
              fontWeight: 700, 
              outline: 'none', 
              transition: 'all 0.2s' 
            }} 
            onFocus={e => e.target.style.borderColor = '#059669'} 
            onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0'} 
            placeholder="Search expertise..." 
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 md:gap-2.5 mb-6 md:mb-10 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`px-4 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black text-xs md:text-[13px] transition-all whitespace-nowrap ${
              activeCategory === cat 
              ? (isDark ? 'bg-white text-slate-900 shadow-xl' : 'bg-slate-900 text-white shadow-lg') 
              : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-100')
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '400px', background: isDark ? '#1e293b' : 'white', borderRadius: '2.5rem', border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`, animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredCourses.map((course, index) => {
              const st = getStatusStyle(course.type);
              
              return (
                <motion.div 
                  key={course.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleEnrollClick(null, course)} 
                  style={{ 
                    background: isDark ? '#1e293b' : 'white', 
                    borderRadius: '2.5rem',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
                    boxShadow: isDark ? 'none' : '0 15px 30px -5px rgba(0,0,0,0.05)',
                  }}
                  className="group flex flex-col cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full"
                >
                  {/* Image Section - Reduced Height for Square Look */}
                  <div className="relative h-48 rounded-[2rem] m-2 overflow-hidden shadow-sm">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-xl shadow-lg backdrop-blur-md ${course.type === 'live' ? 'bg-rose-100/90 text-rose-600' : 'bg-white/90 text-emerald-600'}`}>
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        {st.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Section - Compacted Padding */}
                  <div className="p-6 pt-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-black tracking-wider uppercase">
                        {course.category_name || 'Expert'}
                      </span>
                      <div className="flex items-center gap-1 text-orange-500 font-black text-xs">
                        <Star size={14} fill="currentColor" /> 4.9+
                      </div>
                    </div>
                    
                    <h3 style={{ color: isDark ? 'white' : '#0f172a' }} className="text-lg font-black leading-tight mb-4 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-6 mt-auto">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                        <Clock size={16} className="text-slate-400" /> 
                        <span>Unlimited</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                        <Award size={16} className="text-slate-400" /> 
                        <span>Advanced</span>
                      </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                      <div style={{ color: isDark ? 'white' : '#0f172a' }} className="text-xl font-black">
                        {formatPrice(course)}
                      </div>
                      <button 
                        onClick={e => {
                          e.stopPropagation();
                          handleEnrollClick(e, course);
                        }}
                        className="px-6 py-3 bg-[#ff7a1a] hover:bg-[#e66a12] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                      >
                        Enroll
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Catalog;