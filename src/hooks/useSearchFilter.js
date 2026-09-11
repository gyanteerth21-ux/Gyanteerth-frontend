import { useState, useMemo } from 'react';

export const useSearchFilter = (data = [], searchKey = 'name') => {
  const [searchQuery, setSearchQuery] = useState('');

  const safeData = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return safeData;
    const lowerQuery = searchQuery.toLowerCase();
    return safeData.filter(item => {
      if (!item) return false;
      // If searchKey is an array of keys
      if (Array.isArray(searchKey)) {
        return searchKey.some(key => {
           const val = item[key];
           return val && String(val).toLowerCase().includes(lowerQuery);
        });
      }
      // Single key search
      const val = item[searchKey];
      return val && String(val).toLowerCase().includes(lowerQuery);
    });
  }, [safeData, searchQuery, searchKey]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData
  };
};
