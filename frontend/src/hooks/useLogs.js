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
 * Design decision: the single source of truth for triggering fetches is
 * the useEffect below. External callers should only mutate state (filters,
 * page, limit), NOT call fetchLogs directly — that would cause double-fetches.
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
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1); // Separate page state for clean control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref to track whether the component is mounted (prevent state updates after unmount)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ─── Single fetch effect — fires whenever filters, page, or limit changes ──
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Clean null/empty values before sending to API
        const params = {
          page,
          limit: pagination.limit,
          ...Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== null && v !== '' && v !== undefined)
          ),
        };

        const response = await getLogs(params);
        if (!mountedRef.current) return;

        setLogs(response.data || []);
        setPagination((prev) => ({
          ...prev,
          ...(response.meta?.pagination || {}),
          currentPage: page,
        }));
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err.message || 'Failed to fetch logs');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, pagination.limit]);

  /**
   * Handle pagination control changes.
   * When limit changes: reset to page 1 (useEffect will fire due to limit change).
   * When page changes: just update page state.
   */
  const handlePageChange = useCallback((newPage, newLimit) => {
    if (newLimit !== undefined) {
      setPagination((prev) => ({ ...prev, limit: newLimit }));
      setPage(1); // Reset to page 1 when page size changes
    } else {
      setPage(newPage);
    }
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to page 1 whenever filters change
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, []);

  const handleSort = useCallback((sortBy, sortOrder) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setPage(1); // Sort always restarts from page 1
  }, []);

  const refresh = useCallback(() => {
    // Trigger re-fetch without changing any state by bumping a refresh counter
    // We do this by creating a new filters object reference (no-op change)
    setFilters((prev) => ({ ...prev }));
  }, []);

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
