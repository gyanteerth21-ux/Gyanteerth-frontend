import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const UnderConstruction = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 bg-white relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-60" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl -ml-40 -mb-40 opacity-40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-2xl"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/10 border border-emerald-100 rotate-6">
          <Construction className="w-12 h-12" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="h-1 w-8 bg-orange-500 rounded-full" />
             <span className="text-orange-600 font-bold text-sm uppercase tracking-widest flex items-center gap-1.5">
               <Sparkles className="w-4 h-4" /> Coming Soon
             </span>
             <div className="h-1 w-8 bg-orange-500 rounded-full" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Something <span className="text-emerald-600">Legendary</span> is being built.
          </h1>
          
          <p className="text-lg text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
            We're currently perfecting this experience. Our engineers and designers are hard at work to bring you something truly remarkable. Stay tuned!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/10"
            >
              <ArrowLeft className="w-5 h-5" /> Go Back
            </button>
            <Link 
              to="/"
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all hover:-translate-y-1 shadow-sm"
            >
              <Home className="w-5 h-5" /> Return Home
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Modern Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
    </div>
  );
};

export default UnderConstruction;
