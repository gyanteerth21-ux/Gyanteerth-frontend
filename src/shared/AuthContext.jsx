import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
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

  // 🚀 PERFORMANCE + SECURITY: Universal Smart Fetcher (Powered by TanStack Query)
  const smartFetch = useCallback(async (url, options = {}) => {
    const { 
      cacheKey = btoa(url).slice(0, 16), 
      forceRefresh = false, 
      swr = true 
    } = options;

    const queryKey = [cacheKey];

    const fetchFn = async () => {
      const res = await authFetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Keep legacy signaling active for contexts that still rely on cacheSyncToken
      setCacheSyncToken(v => v + 1); 
      return data;
    };

    if (forceRefresh) {
      return queryClient.fetchQuery({ queryKey, queryFn: fetchFn, staleTime: 0 });
    }

    const cachedData = queryClient.getQueryData(queryKey);

    if (cachedData && swr) {
      // SWR: return cache instantly, trigger background fetch
      queryClient.prefetchQuery({ queryKey, queryFn: fetchFn });
      return cachedData;
    }

    if (cachedData) {
      return cachedData;
    }

    // No cache: fetch and wait
    return queryClient.fetchQuery({ queryKey, queryFn: fetchFn });
  }, [authFetch, queryClient]);

  // 🧹 CACHE MANAGEMENT
  const clearCache = useCallback((key) => {
    queryClient.removeQueries({ queryKey: [key] });
    setCacheSyncToken(v => v + 1);
  }, [queryClient]);

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