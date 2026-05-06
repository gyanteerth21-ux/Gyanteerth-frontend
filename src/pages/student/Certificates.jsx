import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Award, ShieldCheck, Zap, Info, Download, Trash2, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { useEnrollment } from '../../shared/EnrollmentContext';
import CertificateGenerator from '../../components/CertificateGenerator';

const Certificates = () => {
  const { user } = useAuth();
  const { enrolledCourses, getCourseProgress } = useEnrollment();
  const [selectedCert, setSelectedCert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadFn, setDownloadFn] = useState(null);

  const handleDownloadReady = React.useCallback((fn) => {
    setDownloadFn(() => fn);
  }, []);

  // 🎓 Identify completed courses (100% progress — strictly backend-verified)
  const earnedCertificates = useMemo(() => {
    const raw = enrolledCourses || [];
    return raw
      .filter(c => (c.progress || 0) === 100)
      .map(c => ({
        id: `GT-${(c.id || c.course_id).toString().slice(-4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        courseId: c.id || c.course_id,
        courseTitle: c.title || c.course_title || 'Professional Certification',
        earnedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        category: c.category_name || 'Technical'
      }));
  }, [enrolledCourses]);

  const filteredCerts = earnedCertificates.filter(c => 
    c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in px-4 md:px-10 max-w-[1600px] mx-auto" style={{ paddingBottom: '4rem' }}>
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-16">
        <div>
          <div className="inline-flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/10">
            <Zap size={12} fill="currentColor" /> Academic Achievements
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
            Verified <span className="text-emerald-600">Certificates</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-lg font-medium max-w-xl leading-relaxed">
            Documents of excellence. You've mastered these domains through dedication and consistency.
          </p>
        </div>

        {/* Search Bar - Optimized for 320px */}
        {earnedCertificates.length > 0 && (
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search achievements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {earnedCertificates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 md:p-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center shadow-sm"
        >
          <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <Award size={48} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">No Certificates Earned Yet</h3>
          <p className="text-slate-500 text-sm md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Finish a course to 100% completion to unlock your professional certification.
          </p>
          <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
            Explore Courses
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-10">
          {filteredCerts.map((cert, idx) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative group"
            >
              {/* Badge Overlay */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md w-11 h-11 rounded-2xl flex items-center justify-center border border-white shadow-lg">
                <ShieldCheck size={24} className="text-emerald-600" />
              </div>
              
              {/* Image Section - Reduced Height for Compact View */}
              <div className="h-44 relative overflow-hidden">
                <img src={cert.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Course" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">{cert.category} Certification</div>
                  <h2 className="text-base font-black text-white leading-tight line-clamp-1">{cert.courseTitle}</h2>
                </div>
              </div>

              {/* Data & Action Section */}
              <div className="p-6 pt-5 flex-1 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Issued Date</span>
                    <span className="text-xs md:text-sm font-black text-slate-900">{cert.earnedDate}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">ID</span>
                    <span className="text-xs md:text-sm font-black text-slate-900 font-mono">{cert.id.split('-').pop()}</span>
                  </div>
                </div>

                <div className="space-y-4 mt-auto">
                  <button 
                    onClick={() => setSelectedCert(cert)}
                    className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs md:text-[13px] flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95"
                  >
                    View & Download <Download size={16} />
                  </button>

                  <div className="bg-emerald-50 rounded-xl py-2.5 px-4 flex items-center gap-2.5 border border-emerald-100/50">
                     <Award size={14} className="text-emerald-600" />
                     <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">Verified Asset</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Dynamic PDF Generation Modal ── */}
      {createPortal(
        <AnimatePresence>
          {selectedCert && (
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[999999] flex items-center justify-center p-4"
              onClick={() => setSelectedCert(null)}
            >
              {/* Top Controls */}
              <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadFn && downloadFn(); }}
                  disabled={!downloadFn}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                >
                  <Download size={18} /> Download PDF
                </button>
                <button 
                  onClick={() => { setSelectedCert(null); setDownloadFn(null); }}
                  className="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-2xl shadow-2xl active:scale-95 transition-all"
                >
                  ×
                </button>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative max-h-[90vh] w-full max-w-4xl flex flex-col items-center overflow-y-auto no-scrollbar"
                onClick={e => e.stopPropagation()}
              >
                <CertificateGenerator 
                  courseId={selectedCert.courseId}
                  onDownload={handleDownloadReady}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default Certificates;

