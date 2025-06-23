import { useState, useEffect, useCallback } from 'react';
import { searchStudents } from '@/lib/utils';
import { Student } from '@/lib/types';

export function useSearch(initialStudents: Student[]) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>(initialStudents);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(
    (searchQuery: string) => {
      setIsSearching(true);
      const filtered = searchStudents(initialStudents, searchQuery);
      setResults(filtered);
      setIsSearching(false);
    },
    [initialStudents]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    isSearching
  };
}