import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(...args);
      setData(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
};

export const usePagination = (fetchFn, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p = 1, filters = params) => {
    setLoading(true);
    try {
      const res = await fetchFn({ ...filters, page: p, limit: 12 });
      const d = res.data;
      setData(p === 1 ? d.data : prev => [...prev, ...d.data]);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  }, [fetchFn, params]);

  useEffect(() => { fetch(1); }, []);

  const loadMore = () => { if (page < pages) fetch(page + 1); };
  const search = (newParams) => { setParams(newParams); fetch(1, newParams); };
  const reset = () => { setParams(initialParams); fetch(1, initialParams); };

  return { data, loading, page, total, pages, hasMore: page < pages, loadMore, search, reset };
};

export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; }
  });
  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {}
  };
  return [storedValue, setValue];
};
