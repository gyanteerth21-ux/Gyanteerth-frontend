import React from 'react';
import { Star, Users, Clock, ArrowRight, Video, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CourseCard = ({ course, onEnrollClick, isEnrolled, role = 'public' }) => {
  const isLive = course.type?.toLowerCase() === 'live' || course.type?.toLowerCase() === 'live session';

  const formatPrice = (course) => {
    if (!course?.price) return 'Free';
    const disc = course.price?.discount !== undefined ? course.price.discount : course.price.discount_price;
    if (disc !== undefined && disc !== null) return `₹${disc}`;
    if (course.price?.original) return `₹${course.price.original}`;
    return 'Free';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      onClick={(e) => onEnrollClick && onEnrollClick(e, course)}
      className="group flex flex-col cursor-pointer transition-all duration-500 hover:shadow-2xl h-full bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
    >
      <div className="relative h-52 overflow-hidden m-2 rounded-2xl shadow-sm">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
          alt={course.title || course.course_title} 
          referrerPolicy="no-referrer" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm backdrop-blur-md flex items-center gap-1.5 uppercase ${isLive ? 'bg-rose-100/90 text-rose-600' : 'bg-white/90 text-emerald-600'}`}>
            {isLive ? <><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> LIVE</> : 'RECORDED'}
          </span>
        </div>
      </div>
      
      <div className="p-6 pt-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black tracking-wider uppercase">
            {course.category_name || 'Expert'}
          </span>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-orange-500 font-black text-xs"><Star className="w-4 h-4 fill-current"/> {course.rating || '4.9+'}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {course.students || course.students_count || '0'}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
          {course.title || course.course_title}
        </h3>
        
        <div className="flex items-center gap-4 mb-6 mt-auto">
          <div className="flex items-center gap-1 text-slate-500 font-bold text-[11px]">
            <Clock size={16} /> <span>{course.duration || 'Unlimited'}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{formatPrice(course)}</span>
            {course.price?.discount && course.price?.original && (
              <span className="text-xs text-slate-400 line-through">₹{course.price.original}</span>
            )}
          </div>
          
          {role === 'public' ? (
            <Link to="/login" className="text-center !text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Enroll Now
            </Link>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEnrollClick && onEnrollClick(e, course);
              }}
              className="px-6 py-2.5 bg-[#ff7a1a] hover:bg-[#e66a12] text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              {isEnrolled ? 'Continue' : 'Enroll'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
