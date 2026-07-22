import { useCallback, useRef } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

/**
 * Debounced global search bar.
 * Fires onSearch only after the user stops typing for `delay` ms.
 *
 * @param {function} onSearch - Called with the search string
 * @param {boolean} loading - Disables input while fetching
 * @param {number} delay - Debounce delay in ms (default 400ms)
 */
const SearchBar = ({ onSearch, loading = false, delay = 400 }) => {
  const timerRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(value.trim());
      }, delay);
    },
    [onSearch, delay]
  );

  const handleSearch = useCallback(
    (value) => {
      clearTimeout(timerRef.current);
      onSearch(value.trim());
    },
    [onSearch]
  );

  return (
    <Search
      id="global-log-search"
      placeholder="Search by actor, action, resource, IP address, region…"
      prefix={<SearchOutlined style={{ color: '#6e7681' }} />}
      onChange={handleChange}
      onSearch={handleSearch}
      loading={loading}
      allowClear
      size="large"
      style={{ width: '100%' }}
      enterButton={
        <span style={{ fontWeight: 500 }}>Search</span>
      }
    />
  );
};

export default SearchBar;
