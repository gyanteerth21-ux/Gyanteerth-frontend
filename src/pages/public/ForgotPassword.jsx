import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, BookOpen, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth_checkpoint/forget_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        // Handle invalid email / account not created edge case
        setError('Invalid mail ID');
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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80')] mix-blend-overlay opacity-30 bg-cover bg-center" />
        <div className="relative z-10 flex items-center gap-3 font-bold text-2xl mb-auto">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <span>Gyanteerth LMS</span>
        </div>
        <div className="relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6"
          >
            Reset your <br /> password
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-emerald-100 text-lg max-w-sm"
          >
            Don't worry, even the brightest minds forget sometimes. We'll help you get back in.
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">Forgot Password?</h2>
                  <p className="text-[var(--color-text-muted)] mt-2 font-medium">Enter your email and we'll send you a reset link</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Email Address</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email" required placeholder="you@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-70"
                  >
                    {loading ? 'Sending Link...' : (
                      <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
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
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Check Your Email</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  We've sent a password reset link to <br />
                  <span className="font-bold text-slate-900">{email}</span>. <br />
                  Please check your inbox and follow the instructions.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full py-4 text-emerald-700 font-bold hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
                  >
                    Resend Email
                  </button>
                  <Link to="/login" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">
                    Return to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
