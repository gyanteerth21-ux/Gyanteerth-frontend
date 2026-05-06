import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Video, Star, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ADMIN_API } from '../../config';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      const headers = {
        'Accept': 'application/json'
      };

      try {
        const statusRes = await fetch(`${ADMIN_API}/courses/ids-by-status`, { headers });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const activeIds = statusData.courses?.active || [];

          const courseDetails = [];
          for (const id of activeIds) {
            try {
              const res = await fetch(`${ADMIN_API}/course/${id}/full-details`, { headers });
              if (res.ok) {
                const data = await res.json();
                const c = data.course || data;
                courseDetails.push({
                  ...c,
                  id: c.course_id || id,
                  course_id: c.course_id || id,
                  title: c.course_title || c.title || 'Untitled',
                  type: c.type || c.course_Type || 'recorded',
                  thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                  rating: c.course_rating || c.rating || c.average_rating || 0,
                  students: c.students || c.enrollment_count || c.student_count || (c.enrollments ? c.enrollments.length : 0)
                });
              }
            } catch (e) { console.error(`Failed to fetch course ${id}`, e); }
          }
          setCourses(courseDetails);
        }
      } catch (err) {
        console.error("Failed to sync architecture", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => {
    if (activeTab === 'all') return true;
    const type = c.type?.toLowerCase();
    // Normalize type comparison
    if (activeTab === 'prerecorded') return type === 'recorded';
    return type === activeTab;
  });
  const topSeller = courses.length > 0 ? courses[0] : null;

  // animations
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300 } } };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Premium Courses</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you want to learn at your own pace or join live interactive sessions, we have the perfect path for you.
          </motion.p>
        </div>

        {/* Top Seller Highlight */}
        <AnimatePresence>
          {topSeller && activeTab === 'all' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}
              className="mb-16 bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100 flex flex-col md:flex-row group"
            >
              <div className="w-full md:w-1/2 relative overflow-hidden min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-current" /> Leading Path
                </div>
                <img src={topSeller.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt={topSeller.title} className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-100/80 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{topSeller.type === 'recorded' ? 'Recorded Course' : 'Live Interactive'}</span>
                  <span className="flex items-center gap-1 text-slate-500 text-sm font-medium"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/> {topSeller.rating || '0'}</span>
                  <span className="flex items-center gap-1 text-slate-500 text-sm font-medium"><Users className="w-4 h-4"/> {topSeller.students || '0'}</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">{topSeller.title}</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">Master the skills you need to succeed with our most popular comprehensive bootcamp. Perfect for beginners and intermediate learners who want to build real-world projects.</p>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-black text-slate-900">₹{topSeller.price?.discount || topSeller.price?.original}</span>
                    {topSeller.price?.discount && (
                      <span className="text-sm md:text-lg text-slate-400 line-through">₹{topSeller.price?.original}</span>
                    )}
                  </div>
                  <Link to={`/signup`} className="w-full sm:w-auto text-center flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 !text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5">
                    Enroll Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60 relative">
            {[
              { id: 'all', label: 'All Courses' },
              { id: 'prerecorded', label: 'Pre-recorded', icon: Play },
              { id: 'live', label: 'Live Sessions', icon: Video },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 md:px-6 py-2 md:py-2.5 text-[10px] md:text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 outline-none ${isActive ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  {isActive && (
                    <motion.div layoutId="courseTab" className="absolute inset-0 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <motion.div key={course.id} variants={itemVariants} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col">
              <div className="relative h-52 overflow-hidden">
                <div className="absolute top-3 left-3 z-10">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md flex items-center gap-1.5 ${course.type?.toLowerCase() === 'live' ? 'bg-rose-500/95 text-white' : 'bg-white/95 text-slate-800'}`}>
                    {course.type?.toLowerCase() === 'live' ? <><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live Session</> : '▶ Recorded'}
                  </span>
                </div>
                <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                 <div className="flex items-center gap-4 text-sm text-slate-500 mb-3 font-medium border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/> {course.rating || '0'}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {course.students || '0'}</span>
                  <span className="flex items-center gap-1 ml-auto"><Clock className="w-4 h-4"/> {course.duration}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">{course.title}</h3>
                 <div className="mt-auto pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600">₹{course.price?.discount || course.price?.original}</span>
                    {course.price?.discount && (
                      <span className="text-xs text-slate-400 line-through">₹{course.price?.original}</span>
                    )}
                  </div>
                  <Link to="/signup" className="w-full sm:w-auto text-center !text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg">
                    Enroll Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg font-medium">Synchronizing Artifacts...</p>
          </div>
        )}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
