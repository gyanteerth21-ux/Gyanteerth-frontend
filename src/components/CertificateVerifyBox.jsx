import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { USER_API } from '../config';

const CertificateVerifyBox = () => {
  const [uuid, setUuid] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanUuid = uuid.trim();
    if (!cleanUuid) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${USER_API}/certificate/${cleanUuid}/verify`);
      const responseData = await response.json();

      if (response.ok && responseData.is_valid) {
        // The API returns { is_valid: true, data: { ...fields } }
        setResult({ success: true, ...responseData.data });
      } else {
        setResult({ 
          success: false, 
          message: responseData.detail?.[0]?.msg || responseData.message || 'The provided ID does not match any certificate in our registry.' 
        });
      }
    } catch (err) {
      setResult({ success: false, message: 'Unable to connect to the verification server at this time.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleVerify} className="flex flex-col md:block relative group gap-4">
        <div className="relative">
          <input 
            type="text" 
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            placeholder="Paste Certificate UUID"
            className="w-full pl-14 md:pr-36 py-4 md:py-5 bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] rounded-2xl text-[var(--color-text)] font-semibold placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
            <Search size={22} />
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading || !uuid.trim()}
          className="md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto px-8 py-4 md:py-3 bg-[var(--color-primary)] text-white font-black rounded-xl hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Credentials'}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`p-8 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden ${result.success ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}
          >
            {result.success && (
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldCheck size={120} />
              </div>
            )}
            
            <div className="flex items-start gap-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {result.success ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
              </div>
              <div className="flex-1">
                <h4 className={`text-2xl font-black mb-4 ${result.success ? 'text-emerald-900' : 'text-red-900'}`}>
                  {result.success ? 'Credential Authenticated' : 'Verification Failed'}
                </h4>
                
                {result.success ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Recipient Name</label>
                        <p className="text-emerald-950 font-black text-lg">{result.user_name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Course Title</label>
                        <p className="text-emerald-950 font-bold">{result.course_name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Duration</label>
                        <p className="text-emerald-950 font-medium italic">{result.course_duration}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Issued Date</label>
                        <p className="text-emerald-950 font-medium">{formatDate(result.issued_date)}</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-800">Verified by Gyanteerth Registry Protocol</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="hidden md:inline text-[9px] font-mono text-emerald-600/40 uppercase tracking-tighter">{result.uuid}</span>
                        <button 
                          onClick={() => { setResult(null); setUuid(''); }}
                          className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                        >
                          Verify Another
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-red-700 font-bold leading-relaxed">{result.message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateVerifyBox;
