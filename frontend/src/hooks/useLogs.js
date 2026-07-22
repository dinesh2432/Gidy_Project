import { useState, useEffect, useCallback, useRef } from 'react';
import { getLogs } from '../services/logService.js';
import { DEFAULT_PAGE_SIZE } from '../constants/index.js';

const initialFilters = {
  search: '',
  role: null,
  action: null,
  resourceType: null,
  severity: null,
  status: null,
  region: null,
  startDate: null,
  endDate: null,
  sortBy: 'timestamp',
  sortOrder: 'desc',
};

/**
 * Custom hook that manages all log fetching state:
 * pagination, filters, search, sorting — all server-side.
 *
 * @param {number} initialLimit - Initial page size
 */
const useLogs = (initialLimit = DEFAULT_PAGE_SIZE) => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    limit: initialLimit,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref to hold current page — avoids stale closure in fetchLogs
  const pageRef = useRef(1);

  const fetchLogs = useCallback(
    async (page = pageRef.current, limit = pagination.limit, currentFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit,
          ...currentFilters,
        };

        const response = await getLogs(params);
        setLogs(response.data || []);
        setPagination(response.meta?.pagination || {
          currentPage: page,
          totalPages: 1,
          totalDocs: 0,
          limit,
        });
        pageRef.current = page;
      } catch (err) {
        setError(err.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.limit, filters]
  );

  // Fetch on mount and whenever filters or limit change — reset to page 1
  useEffect(() => {
    pageRef.current = 1;
    fetchLogs(1, pagination.limit, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.limit]);

  const handlePageChange = useCallback(
    (page, limit) => {
      setPagination((prev) => ({ ...prev, limit }));
      fetchLogs(page, limit, filters);
    },
    [fetchLogs, filters]
  );

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const handleSort = useCallback((sortBy, sortOrder) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const refresh = useCallback(() => {
    fetchLogs(pageRef.current, pagination.limit, filters);
  }, [fetchLogs, pagination.limit, filters]);

  return {
    logs,
    pagination,
    filters,
    loading,
    error,
    handlePageChange,
    handleFilterChange,
    handleResetFilters,
    handleSort,
    refresh,
  };
};

export default useLogs;
