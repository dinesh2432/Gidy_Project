import { useState, useEffect, useCallback } from 'react';
import { getLogStats } from '../services/logService.js';

/**
 * Custom hook for fetching and caching dashboard statistics.
 * Auto-refreshes on mount.
 */
const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLogStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default useStats;
