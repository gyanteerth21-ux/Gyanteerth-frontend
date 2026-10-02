import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { AlertCircle, X, Check } from 'lucide-react';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    resolve: null,
  });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, message, resolve });
    });
  }, []);

  const handleClose = (result) => {
    if (confirmState.resolve) confirmState.resolve(result);
    setConfirmState({ isOpen: false, message: '', resolve: null });
  };

  const Modal = typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      {confirmState.isOpen && (
        <div 
          className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => handleClose(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-[100px] -z-10" />
            
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <AlertCircle size={28} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Action Required</h3>
            <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm leading-relaxed mb-8">
              {confirmState.message}
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors flex justify-center items-center gap-2 cursor-pointer"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={() => handleClose(true)}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-[0_8px_20px_rgba(244,63,94,0.3)] transition-all flex justify-center items-center gap-2 cursor-pointer"
              >
                <Check size={18} /> Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {Modal}
    </ConfirmContext.Provider>
  );
};
