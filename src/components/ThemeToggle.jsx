import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Moon size={20} className="text-emerald-400 fill-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Sun size={20} className="text-orange-500 fill-orange-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export default ThemeToggle;
