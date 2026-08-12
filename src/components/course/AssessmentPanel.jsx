import React, { useState, useEffect, useCallback } from 'react';
import { Award, Clock, RefreshCcw, AlertCircle, Loader2, Check, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../shared/AuthContext';
import { USER_API } from '../../config';

export function AssessmentPanel({ lesson, onComplete, assessmentStats = {}, onStateChange }) {
  const { user, authFetch, clearCache } = useAuth();
  const [toast, setToast] = useState(null);
  
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 7000);
  }, []);

  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetRequestStatus, setResetRequestStatus] = useState(null);

  const normId = (lesson.id || '').toString().toLowerCase();
  const stats = assessmentStats[normId] || { attempts_used: 0, passed: false };
  const limit = (lesson.attemptLimit !== undefined && lesson.attemptLimit !== null) ? Number(lesson.attemptLimit) : 3;
  const attemptsLeft = Math.max(0, limit - stats.attempts_used);
  const isBlocked = attemptsLeft <= 0 && !stats.passed;
  const alreadyPassed = stats.passed;

  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState((lesson.duration || 30) * 60);
  const strikeKey = user?.user_id ? `asm_strikes_${user.user_id}_${lesson.id}` : null;
  const [strikes, setStrikes] = useState(() => {
    if (!strikeKey) return 0;
    return parseInt(localStorage.getItem(strikeKey) || '0');
  });

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting || submitted) return;
    setSubmitting(true);

    const performSubmit = async (attemptNum = 1) => {
      try {
        let timeTakenSeconds = 0;
        if (user?.user_id) {
          const sessionStart = localStorage.getItem(`asm_start_${user.user_id}_${lesson.id}`);
          if (sessionStart) {
            timeTakenSeconds = Math.max(0, Math.floor((Date.now() - parseInt(sessionStart)) / 1000));
          }
        }
        const result = await onComplete(selected, timeTakenSeconds);
        setScore(result?.score ?? 0);
        setSubmitted(true);
        setIsStarted(false);
        if (user?.user_id) {
          localStorage.removeItem(`asm_start_${user.user_id}_${lesson.id}`);
          localStorage.removeItem(`asm_strikes_${user.user_id}_${lesson.id}`);
        }
        if (onStateChange) onStateChange(false);
      } catch (err) {
        console.error(`Submission attempt ${attemptNum} failed:`, err);
        const msg = err.message || 'Submission failed';
        if (attemptNum < 3 && !msg.toLowerCase().includes('attempt')) {
          setRetryCount(attemptNum);
          setTimeout(() => performSubmit(attemptNum + 1), 2000);
          return;
        }
        showToast(msg, 'error');
        if (msg.toLowerCase().includes('attempt')) {
          setSubmitted(true);
          setIsStarted(false);
          if (user?.user_id) {
            localStorage.removeItem(`asm_start_${user.user_id}_${lesson.id}`);
            localStorage.removeItem(`asm_strikes_${user.user_id}_${lesson.id}`);
          }
          if (onStateChange) onStateChange(false);
        }
      } finally {
        if (attemptNum >= 3 || !submitting) {
          setSubmitting(false);
          setRetryCount(0);
        }
      }
    };
    await performSubmit();
  }, [onComplete, selected, submitting, submitted, showToast, lesson.id, user, onStateChange]);

  useEffect(() => {
    if (submitted || !user?.user_id) return;
    const sessionKey = `asm_start_${user.user_id}_${lesson.id}`;
    const sessionStart = localStorage.getItem(sessionKey);
    const sessionStrikes = localStorage.getItem(strikeKey);

    if (sessionStart) {
      const start = parseInt(sessionStart);
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = (lesson.duration * 60) - elapsed;

      if (remaining > 0) {
        setTimeLeft(remaining);
        setStrikes(parseInt(sessionStrikes || '0'));
        setIsStarted(true);
        if (onStateChange) onStateChange(true);
      } else {
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(strikeKey);
        setStrikes(parseInt(sessionStrikes || '0'));
        handleSubmit(true);
      }
    }
  }, [lesson.id, lesson.duration, user?.user_id, submitted, strikeKey, onStateChange, handleSubmit]);

  const handleStart = () => {
    if (!user?.user_id || alreadyPassed) return;
    localStorage.setItem(`asm_start_${user.user_id}_${lesson.id}`, Date.now().toString());
    localStorage.setItem(`asm_strikes_${user.user_id}_${lesson.id}`, '0');
    setIsStarted(true);
    if (onStateChange) onStateChange(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, handleSubmit, timeLeft]);

  useEffect(() => {
    if (!isStarted) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setStrikes(s => {
          const next = s + 1;
          if (user?.user_id) {
            localStorage.setItem(`asm_strikes_${user.user_id}_${lesson.id}`, next.toString());
          }
          if (next >= 3) {
            handleSubmit(true);
            showToast('Security Breach: 3 strikes reached. Attempt submitted.', 'error');
          }
          return next;
        });
      }
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Your assessment is in progress. Leaving will count as a used attempt.';
      return e.returnValue;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, handleSubmit, showToast, lesson.id, user]);

  const handleRequestReset = async () => {
    if (!resetReason.trim()) return showToast('Please provide a reason', 'error');
    setResetLoading(true);
    try {
      const res = await authFetch(`${USER_API}/assessment/${lesson.id}/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: resetReason })
      });
      if (res.ok) {
        showToast('Reset request sent successfully');
        setResetRequestStatus('sent');
        setShowResetModal(false);
        clearCache(`resets_${user.user_id}_${lesson.id}`);
      } else {
        const d = await res.json();
        showToast(d.detail || 'Request failed', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const passed = score >= (lesson.passingMark || 0) || alreadyPassed;

  return (
    <div style={{ position: 'relative' }}>
      {!isStarted && !submitted ? (
        <div style={{ background: 'white', borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Award size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>{lesson.title}</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            This is a timed evaluation. Once started, you cannot pause the timer. Please ensure you have a stable connection.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{lesson.duration}m</div>
            </div>
            <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Questions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{lesson.questions?.length}</div>
            </div>
            <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Attempts Used</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{stats.attempts_used} / {limit}</div>
            </div>
          </div>

          {alreadyPassed ? (
            <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 800 }}>
              ✓ You have already passed this assessment.
            </div>
          ) : isBlocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ padding: '1.5rem', width: '100%', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 800 }}>
                ✕ Attempt limit reached.
              </div>
              {resetRequestStatus === 'sent' ? (
                <div style={{ padding: '1rem 2rem', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> Reset request pending approval.
                </div>
              ) : (
                <button 
                  onClick={() => setShowResetModal(true)}
                  style={{ padding: '1rem 2.5rem', borderRadius: '12px', background: 'var(--color-surface)', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <RefreshCcw size={18} /> Request Attempt Reset
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleStart}
              style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', color: 'white', border: 'none', padding: '1.25rem 3rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 25px rgba(99,102,241,0.3)' }}
            >
              Start Assessment
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', borderRadius: '16px', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={20} color="white" /></div>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{lesson.title}</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>{Object.keys(selected).length} of {lesson.questions?.length} Answered</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {strikes > 0 && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 900, background: 'rgba(239,68,68,0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>⚠️ Security Warning ({strikes})</div>}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Time Remaining</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft < 60 ? '#ef4444' : 'white', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</div>
              </div>
            </div>
          </div>

          {submitted ? (
            <div style={{ background: passed ? '#f0fdf4' : '#fef2f2', border: `2px solid ${passed ? '#10b981' : '#ef4444'}`, borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', animation: 'zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: passed ? '#065f46' : '#991b1b', marginBottom: '0.5rem' }}>{passed ? 'Assessment Passed' : 'Assessment Failed'}</div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: passed ? '#065f46' : '#991b1b', marginBottom: '0.5rem' }}>{passed ? 'Excellent Work!' : 'Please Review and Try Again'}</h3>
              <p style={{ color: passed ? '#047857' : '#b91c1c', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Your Final Score: <strong>{score} / {lesson.totalMark}</strong></p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {!passed && attemptsLeft > 0 && (
                  <button onClick={() => {
                    setSubmitted(false); setSelected({}); setScore(0); setTimeLeft(lesson.duration * 60); setStrikes(0);
                    if (user?.user_id) {
                      localStorage.removeItem(`asm_start_${user.user_id}_${lesson.id}`);
                      localStorage.removeItem(`asm_strikes_${user.user_id}_${lesson.id}`);
                    }
                  }} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', padding: '1rem 2.5rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>Retake Assessment</button>
                )}
                <button onClick={() => window.location.reload()} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 2.5rem', fontWeight: 800, cursor: 'pointer' }}>Back to Course</button>
              </div>
            </div>
          ) : (
            <>
              {(lesson.questions || []).map((q, qi) => (
                <div key={q.question_id} className="p-4 sm:p-8" style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{qi + 1}</span>
                    <p style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.5, margin: 0, color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.question_text}</p>
                  </div>
                  <div className="ml-0 sm:ml-12 mt-2 sm:mt-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(q.options || []).map(opt => {
                      const isSel = selected[q.question_id] === opt.option_id;
                      return (
                        <button key={opt.option_id} onClick={() => setSelected(p => ({ ...p, [q.question_id]: opt.option_id }))} className="p-3 sm:px-5 sm:py-4" style={{ textAlign: 'left', borderRadius: '12px', cursor: 'pointer', border: `2px solid ${isSel ? '#6366f1' : '#f1f5f9'}`, background: isSel ? '#f5f3ff' : 'white', color: isSel ? '#4338ca' : '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', transition: 'all 0.2s' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${isSel ? '#6366f1' : '#d1d5db'}`, background: isSel ? '#6366f1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, marginTop: '0.15rem' }}>
                            {isSel && <Check size={14} color="white" />}
                          </div>
                          <span style={{ fontWeight: 700, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1', textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '14px', padding: '1.25rem 4rem', fontSize: '1.1rem', fontWeight: 900, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: submitting ? 0.7 : 1, margin: '0 auto', boxShadow: '0 10px 25px rgba(16,185,129,0.2)' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      {retryCount > 0 ? `Retrying (${retryCount}/3)...` : 'Finalizing...'}
                    </>
                  ) : (
                    <>
                      <Award size={22} /> Submit Evaluation
                    </>
                  )}
                </button>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>Ensure all questions are answered before submitting.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Request Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !resetLoading && setShowResetModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '450px', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 900 }}>Request Attempt Reset</h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Please explain why you need an additional attempt for this assessment.</p>
              
              <textarea 
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder="Ex: My internet disconnected during the last attempt..."
                style={{ width: '100%', height: '120px', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, outline: 'none', resize: 'none', marginBottom: '1.5rem', color: '#1e293b' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => setShowResetModal(false)} 
                  disabled={resetLoading}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestReset} 
                  disabled={resetLoading}
                  style={{ flex: 1.5, padding: '0.85rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {resetLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
