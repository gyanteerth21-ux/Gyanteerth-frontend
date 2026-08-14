import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "../../shared/schemas";
import { useAuth } from "../../shared/AuthContext";
import { useTheme } from "../../shared/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  CheckCircle,
} from "lucide-react";
import Logo from "../../components/Logo";
import { USER_API, API_BASE } from "../../config";

const Login = () => {
  // View mode: 'login' | 'register'
  const [mode, setMode] = useState("login");

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmitForm,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    setValue: setLoginValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmitForm,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    reset: resetSignup,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { login, authFetch } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback(
    async (data) => {
      const userRole =
        (data.role || "student") === "user"
          ? "student"
          : data.role || "student";
      const isStudent = userRole === "student" || userRole === "user";

      let profile = null;
      let isComplete = true;

      login(
        {
          user_id: data.user_id,
          email: data.email || email.trim(),
          role: userRole,
        },
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
      );

      if (isStudent) {
        try {
          const response = await authFetch(`${USER_API}/profile`);
          if (response.ok) {
            profile = await response.json();
            isComplete =
              profile?.user_name &&
              profile?.user_number &&
              profile?.user_dob &&
              profile?.user_gender;

            login(
              {
                user_id: data.user_id || profile?.user_id,
                email: data.email || email.trim(),
                role: userRole,
                name: profile?.user_name || data.name || "User",
                pic: profile?.user_pic || null,
              },
              { access_token: data.access_token },
            );
          }
        } catch (err) {
          console.error("Profile check failed:", err);
        }
      }

      navigate(`/${userRole}`);
    },
    [email, login, authFetch, navigate],
  );

  const handleLoginSubmit = async (formData) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_BASE}/auth_checkpoint/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ Email: formData.email.trim(), password: formData.password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        await handleAuthSuccess({ ...data, email: formData.email.trim() });
      } else {
        setError(
          data.message ||
            (Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail) ||
            "Invalid credentials",
        );
      }
    } catch (err) {
      setError("Failed to connect to the server");
    }
  };

  const handleRegisterSubmit = async (formData) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_BASE}/auth_checkpoint/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMode("login");
        setLoginValue("email", formData.email.trim());
        setSuccessMsg(
          data.message || "Account created successfully. You can now log in.",
        );
        resetSignup();
      } else {
        setError(data.message || data.detail?.[0]?.msg || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-bg)] overflow-hidden">
      {/* Left Branding Panel */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col w-5/12 bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 text-white p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513258496099-48168024aec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] mix-blend-overlay opacity-30 bg-cover bg-center grayscale contrast-125" />
        <div className="relative z-10 mb-auto">
          <Logo scale={0.8} isDark={true} />
        </div>
        <div className="relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6"
          >
            Welcome back to <br /> excellence
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-emerald-100 text-lg max-w-sm"
          >
            Join our platform to advance your skills and track your progress
            securely.
          </motion.p>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 border-4 border-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -left-12 w-48 h-48 bg-emerald-500/30 rounded-full blur-3xl opacity-50" />
      </motion.div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 py-12 relative z-10 bg-[var(--color-bg)] shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="lg:hidden flex justify-center mb-8">
          <Logo scale={0.7} />
        </div>

        <motion.div
          key={mode}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl mx-auto bg-[var(--color-surface)] p-6 sm:p-10 rounded-2xl shadow-2xl border border-[var(--color-border)]"
        >
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex items-center justify-center bg-[var(--color-primary-bg)] text-[var(--color-primary)] w-12 h-12 rounded-xl mb-4 shadow-sm border border-[var(--color-primary)]/10">
              {mode === "login" && <Lock className="w-6 h-6" />}
              {mode === "register" && <User className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-[var(--color-text-muted)] mt-1 font-medium text-sm">
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Register to start your learning journey"}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700"
              >
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmitForm(handleLoginSubmit)} className="space-y-4">
              <div className="space-y-4 pt-1">
                <div className="relative group">
                  <label className="text-sm font-semibold text-[var(--color-text)] mb-1 block">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...registerLogin("email")}
                      className={`w-full pl-10 pr-4 py-3.5 bg-[var(--color-surface-muted)] border ${loginErrors.email ? 'border-red-500' : 'border-[var(--color-border)]'} rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm`}
                    />
                  </div>
                  {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>}
                </div>

                <div className="relative group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-[var(--color-text)] block">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      title="Reset your password"
                      className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerLogin("password")}
                      className={`w-full pl-10 pr-12 py-3.5 bg-[var(--color-surface-muted)] border ${loginErrors.password ? 'border-red-500' : 'border-[var(--color-border)]'} rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  style={{
                    background: isDark ? "white" : "#0f172a",
                    color: isDark ? "#0f172a" : "white",
                    boxShadow: isDark
                      ? "none"
                      : "0 4px 14px 0 rgba(15,23,42,0.39)",
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 font-bold rounded-lg hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoginSubmitting ? (
                    "Authenticating..."
                  ) : (
                    <>
                      Secure Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-center mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Sign up
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleSignupSubmitForm(handleRegisterSubmit)} className="space-y-4">
              <div className="space-y-4 pt-1">
                <div className="relative group">
                  <label className="text-sm font-semibold text-[var(--color-text)] mb-1 block">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...registerSignup("name")}
                      className={`w-full pl-10 pr-4 py-3.5 bg-[var(--color-surface-muted)] border ${registerErrors.name ? 'border-red-500' : 'border-[var(--color-border)]'} rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm`}
                    />
                  </div>
                  {registerErrors.name && <p className="text-red-500 text-xs mt-1">{registerErrors.name.message}</p>}
                </div>

                <div className="relative group">
                  <label className="text-sm font-semibold text-[var(--color-text)] mb-1 block">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...registerSignup("email")}
                      className={`w-full pl-10 pr-4 py-3.5 bg-[var(--color-surface-muted)] border ${registerErrors.email ? 'border-red-500' : 'border-[var(--color-border)]'} rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm`}
                    />
                  </div>
                  {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
                </div>

                <div className="relative group">
                  <label className="text-sm font-semibold text-[var(--color-text)] mb-1 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerSignup("password")}
                      className={`w-full pl-10 pr-12 py-3.5 bg-[var(--color-surface-muted)] border ${registerErrors.password ? 'border-red-500' : 'border-[var(--color-border)]'} rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors p-1"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {registerErrors.password && <p className="text-red-500 text-xs mt-1">{registerErrors.password.message}</p>}
                </div>

                <div className="relative group">
                  <label className="text-sm font-semibold text-[var(--color-text)] mb-1 block">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[var(--color-text-light)] group-focus-within:text-[var(--color-primary)] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerSignup("confirmPassword")}
                      className={`w-full pl-10 pr-12 py-3.5 bg-[var(--color-surface-muted)] border ${registerErrors.confirmPassword ? 'border-red-500' : 'border-[var(--color-border)]'} rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors p-1"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerErrors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isRegisterSubmitting}
                  style={{
                    background: isDark ? "white" : "#0f172a",
                    color: isDark ? "#0f172a" : "white",
                    boxShadow: isDark
                      ? "none"
                      : "0 4px 14px 0 rgba(15,23,42,0.39)",
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 font-bold rounded-lg hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isRegisterSubmitting ? (
                    "Creating Account..."
                  ) : (
                    <>
                      Create Account <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-center mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
