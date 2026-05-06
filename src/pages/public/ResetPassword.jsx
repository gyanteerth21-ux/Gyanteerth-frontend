import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, BookOpen, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../../config';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email'); // Optional: extract email if provided in link

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth_checkpoint/update_password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          new_password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || data.detail?.[0]?.msg || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-bg)] overflow-hidden" style={{ color: 'var(--color-text)' }}>
      {/* Branding Panel */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col w-5/12 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80')] mix-blend-overlay opacity-30 bg-cover bg-center" />
        <div className="relative z-10 flex items-center gap-3 font-bold text-2xl mb-auto">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <span>Gyanteerth LMS</span>
        </div>
        <div className="relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6"
          >
            Create your <br /> new password
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-emerald-100 text-lg max-w-sm"
          >
            Almost there! Set a strong password to protect your account and resume your learning.
          </motion.p>
        </div>
      </motion.div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 py-12 relative z-10 bg-[var(--color-bg)]/50 backdrop-blur-xl">

        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-8 gap-2 items-center text-emerald-800 font-bold text-xl">
          <BookOpen className="w-6 h-6" /> Gyanteerth
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-xl mx-auto bg-[var(--color-surface)] backdrop-blur-lg p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-[var(--color-border)]"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">New Password</h2>
                  <p className="text-[var(--color-text-muted)] mt-2 font-medium">
                    You are here to change the password {email ? `for ${email}` : 'for this mailid form only'}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700"
                  >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                  <div className="space-y-5">
                    <div className="relative group">
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">New Password</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required placeholder="Enter new password"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Confirm Password</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required placeholder="Confirm new password"
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Updating...' : (
                      <>Update Password <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Password Updated!</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Your password has been changed successfully. <br />
                  You will be redirected to the login page shortly.
                </p>
                <Link to="/login" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">
                  Sign In Now
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
