import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

const USER_KEY = '_gt_usr_profile';
const TOKEN_KEY = '_gt_auth_tkn';
const REFRESH_KEY = '_gt_ref_tkn';
const CACHE_PREFIX = '_gt_cache_';
const CACHE_TTL = 30 * 60 * 1000; // Default 30 minutes

// 🛡️ SECURITY: Simple obfuscation to prevent trivial local storage inspection
const obfuscate = (str) => btoa(encodeURIComponent(str).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (i % 5))).join(''));
const deobfuscate = (str) => {
  try {
    return decodeURIComponent(atob(str).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (i % 5))).join(''));
  } catch (e) { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheSyncToken, setCacheSyncToken] = useState(0); // 🚀 REVALIDATION ENGINE

  // Initialize Auth State
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user session");
          localStorage.removeItem(USER_KEY);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Secure Login
  const login = useCallback((userData, tokens) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    if (tokens?.access_token) {
      localStorage.setItem(TOKEN_KEY, tokens.access_token);
    }
    if (tokens?.refresh_token) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    }
    // Bust all cache on login to ensure fresh data for the new session
    setCacheSyncToken(v => v + 1);
  }, []);

  // Secure Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    
    // 🛡️ SECURITY: Deep clear all obfuscated cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX) || key.includes('cache')) {
        localStorage.removeItem(key);
      }
    });
    setCacheSyncToken(0);
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        console.warn("Session expired. Logging out.");
        logout();
        window.location.href = '/login'; 
      }
      
      return response;
    } catch (error) {
      console.error("Secure fetch failed:", error);
      throw error;
    }
  }, [logout]);

  // 🚀 PERFORMANCE + SECURITY: Universal Smart Fetcher (SWR + De-duplication)
  const activeRequests = useRef({});

  const smartFetch = useCallback(async (url, options = {}) => {
    const { 
      cacheKey = btoa(url).slice(0, 16), 
      forceRefresh = false, 
      ttl = CACHE_TTL,
      swr = true // 🔄 Enable Stale-While-Revalidate by default
    } = options;

    const storageKey = `${CACHE_PREFIX}${cacheKey}`;

    // 1. Instant Cache Retrieval (Deobfuscated)
    const getCachedEntry = () => {
      const item = localStorage.getItem(storageKey);
      if (!item) return null;
      const dec = deobfuscate(item);
      if (!dec) return null;
      try {
        return JSON.parse(dec);
      } catch (e) { return null; }
    };

    const entry = getCachedEntry();
    const cachedData = entry?.data;
    const isExpired = entry ? (Date.now() - entry.ts > ttl) : true;

    // 2. De-duplication: Return existing in-flight promise if identical URL
    if (activeRequests.current[storageKey]) {
      return activeRequests.current[storageKey];
    }

    // 3. Stale-While-Revalidate Logic
    const performFetch = async (currentData = null) => {
      try {
        const res = await authFetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const freshData = await res.json();

        // Only trigger update if data actually changed to prevent render loops
        const dataChanged = JSON.stringify(freshData) !== JSON.stringify(currentData);
        
        // 🛡️ SECURITY: Store obfuscated with integrity TS
        const newEntry = JSON.stringify({ data: freshData, ts: Date.now() });
        localStorage.setItem(storageKey, obfuscate(newEntry));

        if (dataChanged) {
          setCacheSyncToken(v => v + 1); // 🔔 Signal all listeners to re-sync
        }

        return freshData;
      } catch (err) {
        console.error("SmartFetch sync failed:", err);
        return currentData; // Fallback to stale on error
      } finally {
        delete activeRequests.current[storageKey];
      }
    };

    // 4. Return Strategy
    if (cachedData && !forceRefresh && !isExpired) {
      if (swr) {
        // Background refresh: Fire and forget (or rather, store in activeRequests)
        activeRequests.current[storageKey] = performFetch(cachedData);
      }
      return cachedData;
    }

    // No cache or forced: Await the fresh data
    const fetchPromise = performFetch(cachedData);
    activeRequests.current[storageKey] = fetchPromise;
    return fetchPromise;
  }, [authFetch]);

  // 🧹 CACHE MANAGEMENT
  const clearCache = useCallback((key) => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    setCacheSyncToken(v => v + 1);
  }, []);

  // 🔄 Force a global re-sync (useful on page transitions)
  const revalidateAll = useCallback(() => {
    setCacheSyncToken(v => v + 1);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      authFetch, 
      smartFetch,
      clearCache,
      revalidateAll,
      cacheSyncToken, // 🚀 Exposed for components to use in deps
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);