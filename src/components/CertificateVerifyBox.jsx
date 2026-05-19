import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  User,
  GraduationCap,
  Copy,
  Calendar,
  Clock,
  Building,
  Check,
  Printer,
  X,
  FileText,
  Lock,
  Globe
} from 'lucide-react';
import { USER_API } from '../config';

const CertificateVerifyBox = () => {
  const [uuid, setUuid] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const cleanUuid = uuid.trim();
    if (!cleanUuid) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${USER_API}/certificate/${cleanUuid}/verify`);
      const responseData = await response.json();

      if (response.ok && responseData.is_valid) {
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

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'May 18, 2026';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate a premium Verification ID based on issued date and course info
  const getVerificationId = (item) => {
    if (!item) return 'GT-VER-2026-0519-6548';
    const dateObj = item.issued_date ? new Date(item.issued_date) : new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const lastDigits = (item.id || item.course_id || '6548').toString().slice(-4);
    return `GT-VER-${year}-${month}${day}-${lastDigits}`;
  };

  return (
    <div className="space-y-8">

      {/* input field */}
      <form onSubmit={handleVerify} className="flex flex-col relative gap-4">
        <div className="relative">
          <input 
            type="text" 
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            placeholder="Paste or Enter Certificate UUID"
            className="w-full pl-14 pr-12 md:pr-48 py-4 md:py-5 bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] rounded-2xl text-[var(--color-text)] font-semibold placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
            <Search size={22} />
          </div>
          {uuid && (
            <button 
              type="button"
              onClick={() => setUuid('')}
              className="absolute right-5 md:right-44 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={18} />
            </button>
          )}
          <button 
            type="submit"
            disabled={loading || !uuid.trim()}
            className="hidden md:flex md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 px-8 py-3.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Credentials'}
          </button>
        </div>
        <button 
          type="submit"
          disabled={loading || !uuid.trim()}
          className="md:hidden w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Credentials'}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`p-6 md:p-10 rounded-[2.5rem] border border-[var(--color-border)] shadow-2xl relative overflow-hidden bg-[var(--color-surface)]`}
          >
            {result.success ? (
              <div className="space-y-8">
                {/* success banner row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[var(--color-text)] font-black text-xl tracking-tight leading-none">CERTIFICATE SUCCESSFULLY VERIFIED</h4>
                        <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">VERIFIED & ACTIVE</span>
                      </div>
                      <p className="text-[var(--color-text-muted)] text-sm font-bold mt-1">This credential is valid and has been officially issued by Gyanteerth Learning Registry.</p>
                    </div>
                  </div>
                  <div className="lg:text-right flex-shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Verified on</p>
                    <p className="text-[var(--color-text)] font-black text-xs mt-0.5">{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} (IST)</p>
                  </div>
                </div>

                {/* 2-column detailed card grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 border-b border-[var(--color-border)] pb-8">
                  {/* Recipient */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <User size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Recipient Name</p>
                      <p className="font-black text-[var(--color-text)] text-sm">{result.user_name}</p>
                    </div>
                  </div>

                  {/* Course Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <GraduationCap size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Course Title</p>
                      <p className="font-black text-[var(--color-text)] text-sm">{result.course_name}</p>
                    </div>
                  </div>

                  {/* Certificate ID */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <FileText size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Certificate ID</p>
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono text-xs text-slate-600 truncate max-w-[150px] md:max-w-[200px]">{result.uuid || uuid}</p>
                        <button 
                          type="button"
                          onClick={() => handleCopy(result.uuid || uuid, 'cert')}
                          className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                          title="Copy Certificate ID"
                        >
                          {copiedId === 'cert' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <Calendar size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Issue Date</p>
                      <p className="font-black text-[var(--color-text)] text-sm">{formatDate(result.issued_date)}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <Clock size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Duration</p>
                      <p className="font-black text-[var(--color-text)] text-sm">{result.course_duration || '2 Hours'}</p>
                    </div>
                  </div>

                  {/* Issued By */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <Building size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Issued By</p>
                      <p className="font-black text-[var(--color-text)] text-sm">Gyanteerth Learning Registry</p>
                    </div>
                  </div>

                  {/* Verification ID */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <ShieldCheck size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Verification ID</p>
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono text-xs text-slate-600 truncate">{getVerificationId(result)}</p>
                        <button 
                          type="button"
                          onClick={() => handleCopy(getVerificationId(result), 'ver')}
                          className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                          title="Copy Verification ID"
                        >
                          {copiedId === 'ver' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                      <Calendar size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Expiry Date</p>
                      <p className="font-black text-[var(--color-text)] text-sm">Does not expire</p>
                    </div>
                  </div>
                </div>

                {/* Verification timeline */}
                <div className="border-b border-[var(--color-border)] pb-8">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-6">Verification Timeline</p>
                  <div className="relative flex items-center justify-between">
                    {/* Background track line */}
                    <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
                    <div className="absolute left-6 right-6 top-4 h-0.5 bg-emerald-500 z-0 transition-all duration-1000" style={{ width: '100%' }} />

                    {/* Timeline Node 1 */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-[var(--color-surface)] text-white flex items-center justify-center shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <p className="text-[11px] font-extrabold text-[var(--color-text)] mt-2">Issued</p>
                      <p className="text-[9px] font-bold text-slate-400">{formatDate(result.issued_date)}</p>
                    </div>

                    {/* Timeline Node 2 */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-[var(--color-surface)] text-white flex items-center justify-center shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <p className="text-[11px] font-extrabold text-[var(--color-text)] mt-2">Recorded on Registry</p>
                      <p className="text-[9px] font-bold text-slate-400">{formatDate(result.issued_date)}</p>
                    </div>

                    {/* Timeline Node 3 */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-[var(--color-surface)] text-white flex items-center justify-center shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <p className="text-[11px] font-extrabold text-[var(--color-text)] mt-2">Verified</p>
                      <p className="text-[9px] font-bold text-slate-400">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>


                {/* Footer action buttons */}
                <div className="flex justify-end pt-4">
                  <button 
                    type="button"
                    onClick={() => { setResult(null); setUuid(''); }}
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RefreshCw size={14} /> Verify Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <AlertCircle size={32} />
                </div>
                <h4 className="text-2xl font-black text-red-900">Verification Failed</h4>
                <p className="text-red-700 font-bold leading-relaxed max-w-md mx-auto">{result.message}</p>
                <button 
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-6 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all mt-4"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateVerifyBox;
