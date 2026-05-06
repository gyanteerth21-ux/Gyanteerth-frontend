import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, CheckCircle2, XCircle, Search, Loader2, 
  RefreshCcw, AlertCircle, User, Award, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { ADMIN_API } from '../../config';

const ResetRequests = () => {
  const { authFetch, smartFetch } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const json = await smartFetch(`${ADMIN_API}/assessment/reset-requests`, { 
        cacheKey: 'admin_reset_requests' 
      });
      if (json) {
        setRequests(json.requests || json.data || []);
      }
    } catch (err) {
      showToast('Failed to fetch reset requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [smartFetch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      const res = await authFetch(`${ADMIN_API}/assessment/reset-request/${requestId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }) // 'Approve' or 'Reject'
      });
      
      if (res.ok) {
        showToast(`Request ${action === 'Approve' ? 'Approved' : 'Rejected'} successfully`);
        setRequests(prev => prev.map(r => 
          r.request_id === requestId ? { ...r, status: action === 'Approve' ? 'Approved' : 'Rejected', resolved_at: new Date().toISOString() } : r
        ));
      } else {
        const d = await res.json();
        showToast(d.detail || 'Action failed', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && (r.status || '').toLowerCase() !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return (r.user_name || r.user_id || '').toLowerCase().includes(q) || 
           (r.assessment_title || r.assessment_id || '').toLowerCase().includes(q) ||
           (r.reason || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-muted)', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text)', paddingBottom: '10rem' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem 0' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-primary)', marginBottom: '0.15rem' }}>
                  <Clock size={14} /><span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Student Support</span>
               </div>
               <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>Assessment Reset Requests</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ position: 'relative' }}>
                 <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                 <input 
                  type="text" 
                  placeholder="Search students or tests..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  style={{ width: '260px', padding: '0.65rem 1rem 0.65rem 2.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: 'var(--color-text)' }} 
                 />
               </div>
               <button onClick={fetchRequests} className="btn" style={{ padding: '0.65rem', borderRadius: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                 <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
               </button>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem var(--page-padding) 2.5rem var(--page-padding)' }}>
        
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '2rem' }}>
           {['pending', 'approved', 'rejected', 'all'].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '1rem', 
                  border: statusFilter === status ? '1px solid transparent' : '1px solid var(--color-border)', 
                  backgroundColor: statusFilter === status ? 'var(--color-primary)' : 'var(--color-surface)', 
                  color: statusFilter === status ? 'white' : 'var(--color-text)', 
                  fontWeight: 850, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '10rem 0' }}>
                <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
                <p style={{ marginTop: '2rem', fontSize: '1rem', fontWeight: 950, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>LOADING REQUESTS...</p>
             </motion.div>
          ) : filteredRequests.length === 0 ? (
             <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '8rem 2rem', backgroundColor: 'var(--color-surface)', borderRadius: '3rem', border: '1px dashed var(--color-border-strong)' }}>
                <Clock size={60} color="var(--color-border-strong)" style={{ marginBottom: '2.5rem' }} />
                <h2>No Requests Found</h2>
                <p style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>There are no {statusFilter !== 'all' ? statusFilter : ''} reset requests to show.</p>
             </motion.div>
          ) : (
             <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {filteredRequests.map((r, index) => (
                  <RequestCard 
                    key={r.request_id} 
                    request={r}
                    index={index}
                    isActionLoading={actionLoading === r.request_id}
                    onAction={(action) => handleAction(r.request_id, action)}
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
      `}</style>
    </div>
  );
};

const RequestCard = ({ request, index, isActionLoading, onAction }) => {
  const isPending = (request.status || '').toLowerCase() === 'pending';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }}
      style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      className="premium-glow-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 950 }}>
            {request.user_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{request.user_name || 'Student'}</h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ID: {request.user_id}</div>
          </div>
        </div>
        <div style={{ 
          padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          backgroundColor: isPending ? '#fef3c7' : request.status === 'Approved' ? '#dcfce7' : '#fee2e2',
          color: isPending ? '#92400e' : request.status === 'Approved' ? '#166534' : '#991b1b'
        }}>
          {request.status}
        </div>
      </div>
      
      <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          <Award size={14} />
          <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{request.assessment_title || 'Assessment'}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={12} /> Requested: {new Date(request.requested_at).toLocaleString()}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MessageSquare size={12} /> Reason for Reset
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text)', fontStyle: 'italic' }}>
          "{request.reason || 'No reason provided.'}"
        </p>
      </div>
      
      {isPending && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button 
            onClick={() => onAction('Approve')} 
            disabled={isActionLoading}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 900, border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Approve
          </button>
          <button 
            onClick={() => onAction('Reject')} 
            disabled={isActionLoading}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 900, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} Reject
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ResetRequests;
