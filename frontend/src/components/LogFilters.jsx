import { Row, Col, Select, DatePicker, Button, Tooltip, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ROLES,
  ACTIONS,
  RESOURCE_TYPES,
  SEVERITY_LEVELS,
  STATUS_TYPES,
  REGIONS,
} from '../constants/index.js';

const { RangePicker } = DatePicker;

const toOptions = (arr) => arr.map((v) => ({ label: v, value: v }));

const selectStyle = { width: '100%' };

/**
 * Advanced filter panel.
 * All changes emit via onFilterChange immediately — debouncing is in useLogs.
 *
 * @param {object} filters - Current filter state from useLogs
 * @param {function} onFilterChange - Callback to update filters
 * @param {function} onReset - Callback to reset all filters
 * @param {boolean} loading - Disable filters while loading
 */
const LogFilters = ({ filters, onFilterChange, onReset, loading }) => {
  const handleSelect = (field) => (value) => {
    onFilterChange({ [field]: value || null });
  };

  const handleDateRange = (dates) => {
    if (!dates) {
      onFilterChange({ startDate: null, endDate: null });
    } else {
      onFilterChange({
        startDate: dates[0]?.toISOString(),
        endDate: dates[1]?.toISOString(),
      });
    }
  };

  const dateRangeValue =
    filters.startDate && filters.endDate
      ? [dayjs(filters.startDate), dayjs(filters.endDate)]
      : null;

  const hasActiveFilters =
    filters.role ||
    filters.action ||
    filters.resourceType ||
    filters.severity ||
    filters.status ||
    filters.region ||
    filters.startDate;

  return (
    <div className="filter-section">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Space>
          <FilterOutlined style={{ color: '#2f81f7' }} />
          <span style={{ fontWeight: 600, color: '#e6edf3', fontSize: 13 }}>
            Filters
          </span>
          {hasActiveFilters && (
            <span
              style={{
                background: '#2f81f7',
                color: '#fff',
                borderRadius: 10,
                fontSize: 11,
                padding: '0 6px',
                fontWeight: 600,
              }}
            >
              Active
            </span>
          )}
        </Space>
        <Tooltip title="Reset all filters">
          <Button
            id="reset-filters-btn"
            size="small"
            icon={<ClearOutlined />}
            onClick={onReset}
            disabled={!hasActiveFilters || loading}
            style={{ fontSize: 12 }}
          >
            Reset
          </Button>
        </Tooltip>
      </div>

      <Row gutter={[10, 10]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            id="filter-role"
            placeholder="Role"
            options={toOptions(ROLES)}
            value={filters.role}
            onChange={handleSelect('role')}
            allowClear
            style={selectStyle}
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            id="filter-severity"
            placeholder="Severity"
            options={toOptions(SEVERITY_LEVELS)}
            value={filters.severity}
            onChange={handleSelect('severity')}
            allowClear
            style={selectStyle}
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            id="filter-status"
            placeholder="Status"
            options={toOptions(STATUS_TYPES)}
            value={filters.status}
            onChange={handleSelect('status')}
            allowClear
            style={selectStyle}
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            id="filter-resourceType"
            placeholder="Resource Type"
            options={toOptions(RESOURCE_TYPES)}
            value={filters.resourceType}
            onChange={handleSelect('resourceType')}
            allowClear
            style={selectStyle}
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            id="filter-region"
            placeholder="Region"
            options={toOptions(REGIONS)}
            value={filters.region}
            onChange={handleSelect('region')}
            allowClear
            showSearch
            style={selectStyle}
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={16} lg={4}>
          <Select
            id="filter-action"
            placeholder="Action"
            options={toOptions(ACTIONS)}
            value={filters.action}
            onChange={handleSelect('action')}
            allowClear
            showSearch
            style={selectStyle}
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={8}>
          <RangePicker
            id="filter-date-range"
            value={dateRangeValue}
            onChange={handleDateRange}
            style={{ width: '100%' }}
            disabled={loading}
            placeholder={['Start Date', 'End Date']}
            showTime={false}
            format="DD MMM YYYY"
          />
        </Col>
      </Row>
    </div>
  );
};

export default LogFilters;
