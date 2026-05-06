import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Award,
  PlayCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  TrendingUp,
  Users,
  Trophy,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { USER_API } from '../../config';
import CertificateVerifyBox from '../../components/CertificateVerifyBox';

const FeatureCard = ({ icon, title, desc, delay, accentColor = "emerald" }) => {
  const accentClasses = {
    emerald: "bg-[var(--color-primary-bg)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white",
    orange: "bg-[var(--color-primary-bg)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="premium-card group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-surface-muted)] rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--color-primary-bg)] transition-colors" />

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 relative z-10 ${accentClasses[accentColor]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-[var(--color-text)] mb-4 relative z-10 tracking-tight leading-tight">{title}</h3>
      <p className="text-[var(--color-text-muted)] font-medium leading-relaxed relative z-10">{desc}</p>

      <div className="mt-8 flex items-center gap-2 text-[var(--color-primary)] font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
        Discover more <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${USER_API}/public-feedback`);
        if (res.ok) {
          const json = await res.json();
          setFeedbacks(json.data || []);
        }
      } catch (err) {
        console.error("Home feed fetch error", err);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] w-full overflow-hidden relative">

      {/* 
        PREMIUM DYNAMIC BACKGROUND 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base Soft Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg)] to-[var(--color-primary-bg)]" />

        {/* Animated Glassy Blobs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 60, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-accent)]/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur shadow-xl border border-[var(--color-border)] text-[var(--color-primary)] font-black text-xs uppercase tracking-widest mb-10">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-primary)]"></span>
                </span>
                World's #1 Learning Community
              </div>

              <h1 className="text-4xl md:text-7xl xl:text-8xl font-black text-[var(--color-text)] leading-[1.05] mb-8 tracking-tighter">
                Level Up your <span className="gradient-text">Learning</span> <br />
                <span className="text-[var(--color-text-light)] font-medium tracking-normal italic text-3xl md:text-5xl xl:text-6xl">With</span> <span className="relative">Gyanteerth
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-2 left-0 h-3 bg-[var(--color-accent)] -z-10 opacity-30 rounded-full"
                  />
                </span>
              </h1>

              <p className="text-xl text-[var(--color-text-muted)] mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold italic">
                The premium ecosystem for modern builders. Attend live interactive masterclasses and earn verifiable certifications from industry giants.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/courses"
                    className="group btn btn-primary px-12 py-6 text-lg rounded-3xl"
                  >
                    <span className="text-white group-hover:text-[var(--color-accent)] font-black transition-colors">Start Learning</span>
                    <ArrowRight className="w-6 h-6 text-white group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
                <Link
                  to="/courses"
                  className="btn bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text)] px-12 py-6 text-lg rounded-3xl border-2 border-[var(--color-border)] shadow-md transition-all"
                >
                  Explore Catalog <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                </Link>
              </div>

              <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-10">
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-[var(--color-primary-bg)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-[var(--color-text-light)] tracking-widest leading-none mb-1">Authenticated</p>
                    <p className="font-black text-[var(--color-text)]">Verifiable Badges</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-[var(--color-accent)]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Star className="w-5 h-5 text-[var(--color-accent)] fill-[var(--color-accent)]" /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-[var(--color-text-light)] tracking-widest leading-none mb-1">Top Rated</p>
                    <p className="font-black text-[var(--color-text)]">4.9/5 Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative w-full max-w-lg mx-auto lg:max-w-none flex items-center justify-center"
            >
              <div className="relative w-full aspect-square max-w-xl group">
                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-orange-400/20 rounded-[4rem] blur-2xl group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 w-full h-full bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white transform hover:rotate-2 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Premium Learning"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                    className="absolute top-10 right-10 p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl text-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white"><TrendingUp className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Career boost</p>
                        <p className="text-2xl font-black">+140% <span className="text-xs">ROI</span></p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }}
                    className="absolute bottom-10 left-10 p-6 bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-100 max-w-[200px]"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex -space-x-3 mb-1">
                        <img className="w-10 h-10 rounded-full border-4 border-white" src="https://i.pravatar.cc/100?img=11" alt="S" />
                        <img className="w-10 h-10 rounded-full border-4 border-white" src="https://i.pravatar.cc/100?img=12" alt="S" />
                        <img className="w-10 h-10 rounded-full border-4 border-white" src="https://i.pravatar.cc/100?img=13" alt="S" />
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600 border-4 border-white">+3K</div>
                      </div>
                      <p className="text-xs font-black text-slate-800 tracking-tight leading-tight">Join our elite circle of learners today.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Improved Logo Cloud */}
        <section className="py-20 bg-[var(--color-surface)]/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="text-3xl font-black tracking-tighter text-[var(--color-text)] border-4 border-[var(--color-text)] px-4 py-1">FORBES</span>
              <span className="text-3xl font-black tracking-tighter text-[var(--color-text)] italic underline decoration-[var(--color-text)] underline-offset-4">TechCrunch</span>
              <span className="text-3xl font-black tracking-tighter text-[var(--color-text)]">WIRED</span>
              <span className="text-3xl font-black tracking-tighter text-[var(--color-text)] border-2 border-[var(--color-text)] rounded-full px-6 py-2">fast.co</span>
              <span className="text-3xl font-black tracking-tighter text-[var(--color-text)] uppercase">the verge</span>
            </div>
          </div>
        </section>

      {/* FEATURES Section */}
        <section className="py-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-2 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-accent)] to-[var(--color-primary)]/20 rounded-full" />

          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-black text-[10px] uppercase tracking-[0.3em] mb-6"
              >
                <Zap className="w-3 h-3 fill-current" /> High Impact Features
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black text-[var(--color-text)] tracking-tight mb-8 leading-none">The Gyanteerth <span className="text-[var(--color-primary)] italic">Edge</span></h2>
              <p className="text-xl text-[var(--color-text-muted)] font-bold leading-relaxed">We architect your entire learning ecosystem to ensure measurable career progression.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              <FeatureCard
                delay={0.1}
                icon={<PlayCircle size={32} strokeWidth={2.5} />}
                title="Interactive Masterclasses"
                desc="Real-time streaming sessions with industry titans and get instant feedback."
              />
              <FeatureCard
                delay={0.2}
                accentColor="orange"
                icon={<Users size={32} strokeWidth={2.5} />}
                title="Elite Communities"
                desc="Specialized cohorts of like-minded experts and build lasting networks."
              />
              <FeatureCard
                delay={0.3}
                icon={<Trophy size={32} strokeWidth={2.5} />}
                title="Global Challenges"
                desc="Compete in real-world projects and projects with Tier-A company access."
              />
              <FeatureCard
                delay={0.4}
                accentColor="orange"
                icon={<Award size={32} strokeWidth={2.5} />}
                title="Verified Badges"
                desc="Achievements are globally immutable and hashed for professional authority."
              />
            </div>
          </div>
        </section>

        {/* 🛡️ NEW: Certificate Verification Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[var(--color-surface)] p-12 md:p-16 rounded-[3rem] shadow-2xl border border-[var(--color-border)] relative overflow-hidden group"
            >
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-[var(--color-primary)]/10" />
              
              <div className="text-center mb-10 relative z-10">
                <div className="w-16 h-16 bg-[var(--color-primary-bg)] text-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text)] tracking-tight mb-4">Verify Achievement</h2>
                <p className="text-[var(--color-text-muted)] font-bold max-w-lg mx-auto">
                  Enter the unique certificate UUID to verify its authenticity and metadata directly from our secure registry.
                </p>
              </div>

              <div className="max-w-2xl mx-auto relative z-10">
                <CertificateVerifyBox />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - REFINED BUTTONS */}
        <section className="py-32 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto relative rounded-[4rem] overflow-hidden bg-[var(--navy-950)] p-12 md:p-24 shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-[80px] -mr-32 -mt-32" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                Architecture your <span className="text-[var(--color-accent)] italic">Future</span> Today.
              </h2>
              <p className="text-xl text-emerald-100/90 mb-12 font-bold leading-relaxed max-w-xl mx-auto">
                Stop settling for basic tutorials. Join the most advanced ecosystem for educational excellence and high-impact career growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  to="/courses"
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto px-12 py-6 bg-white text-[var(--navy-950)] font-black rounded-3xl shadow-2xl hover:bg-[var(--color-accent)] hover:text-white transition-all hover:-translate-y-1 text-lg"
                >
                  Explore Catalog <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-[var(--color-primary)] group-hover:text-white" />
                </Link>
                <Link
                  to="/under-construction"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-6 border-2 border-white/30 hover:border-white text-white font-black rounded-3xl transition-all hover:bg-white/10"
                >
                  View Pricing <ArrowRight className="w-5 h-5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section - Dynamic */}
        {feedbacks.length > 0 && (
          <section className="py-32 bg-[var(--color-surface-muted)] overflow-hidden relative border-t border-[var(--color-border)]">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 font-bold">
              <div className="text-center mb-16">
                 <h3 className="text-[var(--color-accent)] font-black uppercase text-[10px] tracking-widest mb-4">Student Success</h3>
                 <h2 className="text-4xl md:text-6xl font-black text-[var(--color-text)] tracking-tight leading-none">See what they're saying</h2>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                {feedbacks.slice(0, 6).map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    className="min-w-[350px] md:min-w-[450px] p-8 md:p-10 bg-[var(--color-surface)] shadow-sm rounded-[2.5rem] border border-[var(--color-border)] snap-center flex flex-col justify-between whitespace-normal"
                  >
                     <div className="flex items-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < Math.round(parseFloat(item.course_rating || item.rating || item.Rating || 0)) ? "var(--color-accent)" : "transparent"} stroke={i < Math.round(parseFloat(item.course_rating || item.rating || item.Rating || 0)) ? "var(--color-accent)" : "var(--color-border-strong)"} />
                        ))}
                     </div>
                     <p className="text-lg md:text-2xl text-[var(--color-text)] font-black leading-tight tracking-tight mb-10 italic">
                       "{item.review}"
                     </p>
                     <div className="flex items-center gap-4 mt-auto border-t border-[var(--color-border)] pt-6">
                       <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-primary)]/20 shadow-sm bg-[var(--color-primary-bg)] flex items-center justify-center font-black text-[var(--color-primary)]">
                         {item.user_pic ? <img src={item.user_pic} className="w-full h-full object-cover" alt={item.user_name} /> : (item.user_name?.charAt(0) || 'S')}
                       </div>
                       <div>
                         <p className="text-[var(--color-text)] font-black text-lg">{item.user_name}</p>
                         <p className="text-[var(--color-primary)] font-bold uppercase text-[10px] tracking-widest">{item.course_title}</p>
                       </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
