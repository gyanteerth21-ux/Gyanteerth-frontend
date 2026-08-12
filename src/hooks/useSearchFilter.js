import { useState, useMemo } from 'react';

export const useSearchFilter = (data, searchKey = 'name') => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item => {
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
  }, [data, searchQuery, searchKey]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData
  };
};
