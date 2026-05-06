import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Star, Search, Loader2, CheckCircle2, AlertCircle, 
  RefreshCcw, Eye, EyeOff, ShieldAlert, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API } from '../../config';

const AdminFeedbacks = () => {
  const { authFetch, smartFetch } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const availableCourses = React.useMemo(() => {
    const courseMap = {};
    feedbacks.forEach(f => {
      if (f.course_id && f.course_title) {
        if (!courseMap[f.course_id]) courseMap[f.course_id] = { id: f.course_id, title: f.course_title, count: 0 };
        courseMap[f.course_id].count++;
      }
    });
    return Object.values(courseMap).sort((a, b) => b.count - a.count);
  }, [feedbacks]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const json = await smartFetch(`${ADMIN_API}/all-feedback`, { cacheKey: 'admin_all_feedbacks' });
      if (json) {
        setFeedbacks(json.data || []);
      }
    } catch (err) {
      showToast('Failed to fetch feedbacks', 'error');
    } finally {
      setLoading(false);
    }
  }, [smartFetch]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    setActionLoading(feedbackId);
    try {
      const res = await authFetch(`${ADMIN_API}/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_status: newStatus })
      });
      if (res.ok) {
        showToast('Feedback status updated');
        setFeedbacks(prev => prev.map(f => 
          f.feedback_id === feedbackId ? { ...f, display_status: newStatus } : f
        ));
      } else {
        const d = await res.json();
        showToast(d.detail || 'Update rejected', 'error');
      }
    } catch (err) {
      showToast('Connection loss', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (courseFilter !== 'All' && f.course_id !== courseFilter) return false;
    const q = searchQuery.toLowerCase();
    return (f.user_name || '').toLowerCase().includes(q) || 
           (f.course_title || '').toLowerCase().includes(q) ||
           (f.review || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-muted)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', paddingBottom: '10rem' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem 0' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.15rem' }}>
                  <MessageSquare size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>User Insights</span>
               </div>
               <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>Feedback Moderation</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ position: 'relative' }}>
                 <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                 <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  style={{ width: '260px', padding: '0.65rem 1rem 0.65rem 2.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: 'var(--color-text)' }} 
                 />
               </div>
               <button onClick={fetchFeedbacks} className="btn" style={{ padding: '0.65rem', borderRadius: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                 <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
               </button>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem var(--page-padding) 2.5rem var(--page-padding)' }}>
        
        {/* Domain Navigation (Categories) */}
        <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }} className="no-scrollbar">
           <button 
             onClick={() => setCourseFilter('All')}
             style={{ 
               padding: '0.5rem 1rem', borderRadius: '1rem', 
               border: courseFilter === 'All' ? '1px solid transparent' : '1px solid var(--color-border)', 
               backgroundColor: courseFilter === 'All' ? 'var(--color-primary)' : 'var(--color-surface)', 
               color: courseFilter === 'All' ? 'white' : 'var(--color-text)', 
               fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
               boxShadow: courseFilter === 'All' ? 'var(--shadow-md)' : 'none',
               display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
             }}
           >
             <MessageSquare size={14} /> All Feedbacks
             <span style={{ background: courseFilter === 'All' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-muted)', color: courseFilter === 'All' ? 'white' : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>{feedbacks.length}</span>
           </button>
           {availableCourses.map(c => (
              <button 
                key={c.id}
                onClick={() => setCourseFilter(c.id)}
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: '1rem', 
                  border: courseFilter === c.id ? '1px solid transparent' : '1px solid var(--color-border)', 
                  backgroundColor: courseFilter === c.id ? 'var(--color-primary)' : 'var(--color-surface)', 
                  color: courseFilter === c.id ? 'white' : 'var(--color-text)', 
                  fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  boxShadow: courseFilter === c.id ? 'var(--shadow-md)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
                }}
              >
                <Star size={14} /> {c.title}
                <span style={{ background: courseFilter === c.id ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-muted)', color: courseFilter === c.id ? 'white' : 'var(--color-text-muted)', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>{c.count}</span>
              </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '10rem 0' }}>
                <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
                <p style={{ marginTop: '2rem', fontSize: '1rem', fontWeight: 950, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>FETCHING INSIGHTS...</p>
             </motion.div>
          ) : filteredFeedbacks.length === 0 ? (
             <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '8rem 2rem', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '1px dashed var(--color-border-strong)' }}>
                <MessageSquare size={60} color="var(--color-border-strong)" style={{ marginBottom: '2.5rem' }} />
                <h2>No Insights Available</h2>
                <p style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>The moderation queue is currently empty.</p>
             </motion.div>
          ) : (
             <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredFeedbacks.map((f, index) => (
                  <FeedbackCard 
                    key={f.feedback_id} 
                    feedback={f}
                    index={index}
                    isActionLoading={actionLoading === f.feedback_id}
                    onStatusChange={(newStatus) => handleUpdateStatus(f.feedback_id, newStatus)}
                  />
                ))}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3500, padding: '1.15rem 3rem', borderRadius: '4rem', backgroundColor: '#111827', color: 'white', fontWeight: '900', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.5s' }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} color="var(--color-primary)" /> : <AlertCircle size={20} color="#ef4444" />}
          {toast.message}
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .rating-star { color: #fbbf24; fill: #fbbf24; }
      `}</style>
    </div>
  );
};

const FeedbackCard = ({ feedback, index, isActionLoading, onStatusChange }) => {
  const isHidden = feedback.display_status === 'hidden';
  const cRating = parseFloat(feedback.course_rating) || 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }}
      style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: isHidden ? 0.7 : 1, transition: 'all 0.3s' }}
      className="premium-glow-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
           <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{feedback.course_title}</div>
           <h3 style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: 900 }}>{feedback.user_name}</h3>
           <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{new Date(feedback.created_at).toLocaleDateString()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--color-surface-muted)', padding: '0.4rem 0.6rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <Star size={14} className="rating-star" /> <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>{cRating.toFixed(1)}</span>
        </div>
      </div>
      
      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text)', flex: 1, fontStyle: 'italic' }}>"{feedback.review}"</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isHidden ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isHidden ? <EyeOff size={14} /> : <Eye size={14} />} {isHidden ? 'Hidden' : 'Public'}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isHidden ? (
            <button onClick={() => onStatusChange('public')} disabled={isActionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800, border: 'none', background: '#dcfce7', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />} Publish
            </button>
          ) : (
             <button onClick={() => onStatusChange('hidden')} disabled={isActionLoading} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <EyeOff size={12} />} Hide
             </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminFeedbacks;
