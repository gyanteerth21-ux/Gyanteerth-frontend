import { useState, useEffect } from 'react';

export const useViewMode = (storageKey = 'preferred_view_mode', defaultMode = 'grid') => {
  const [viewMode, setViewModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === 'grid' || stored === 'list' ? stored : defaultMode;
    } catch (e) {
      return defaultMode;
    }
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(storageKey, mode);
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  return { viewMode, setViewMode };
};
