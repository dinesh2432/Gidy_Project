import { useCallback, useRef, useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

/**
 * Debounced global search bar.
 * Fires onSearch only after the user stops typing for `delay` ms.
 * Clears the timer on unmount to prevent memory leaks.
 *
 * @param {function} onSearch - Called with the search string
 * @param {boolean} loading - Disables input while fetching
 * @param {number} delay - Debounce delay in ms (default 400ms)
 */
const SearchBar = ({ onSearch, loading = false, delay = 400 }) => {
  const timerRef = useRef(null);

  // Clear timer on unmount to prevent calling onSearch on an unmounted component
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(value.trim());
      }, delay);
    },
    [onSearch, delay]
  );

  const handleSearch = useCallback(
    (value) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      onSearch(value.trim());
    },
    [onSearch]
  );

  return (
    <Search
      id="global-log-search"
      placeholder="Search by actor, action, resource, IP address, region, status…"
      prefix={<SearchOutlined style={{ color: '#6e7681' }} />}
      onChange={handleChange}
      onSearch={handleSearch}
      loading={loading}
      allowClear
      size="large"
      style={{ width: '100%' }}
      enterButton={<span style={{ fontWeight: 500 }}>Search</span>}
    />
  );
};

export default SearchBar;
