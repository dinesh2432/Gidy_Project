import { useState, useCallback } from 'react';
import {
  Typography, Space, Button, Tooltip, Alert, Row, Col, Card, Select,
  DatePicker, Statistic, message,
} from 'antd';
import {
  FilterOutlined, DownloadOutlined, ReloadOutlined, ClearOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useLogs from '../hooks/useLogs.js';
import LogTable from '../components/LogTable.jsx';
import LogDetailDrawer from '../components/LogDetailDrawer.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SeverityTag from '../components/SeverityTag.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  ROLES, ACTIONS, RESOURCE_TYPES, SEVERITY_LEVELS, STATUS_TYPES, REGIONS,
} from '../constants/index.js';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const toOptions = (arr) => arr.map((v) => ({ label: v, value: v }));

/**
 * Dedicated Audit Logs page — a focused investigation view.
 * Provides the same filtering/search/sort capabilities as the Dashboard
 * but without the stats cards, so the full screen is devoted to the table.
 */
const AuditLogsPage = () => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
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
  } = useLogs(50); // Larger default for a dedicated investigation view

  const handleSearch = useCallback((value) => {
    handleFilterChange({ search: value });
  }, [handleFilterChange]);

  const handleRowClick = (record) => {
    setSelectedLog(record);
    setDrawerOpen(true);
  };

  const handleDateRange = (dates) => {
    if (!dates) {
      handleFilterChange({ startDate: null, endDate: null });
    } else {
      handleFilterChange({
        startDate: dates[0]?.toISOString(),
        endDate: dates[1]?.toISOString(),
      });
    }
  };

  const handleExportPage = () => {
    if (!logs.length) {
      message.warning('No logs on this page to export');
      return;
    }
    const exportData = logs.map(({ _id, uploadBatch, createdAt, updatedAt, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_investigation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Exported ${logs.length} records`);
  };

  const dateRangeValue =
    filters.startDate && filters.endDate
      ? [dayjs(filters.startDate), dayjs(filters.endDate)]
      : null;

  const hasActiveFilters = filters.role || filters.action || filters.resourceType ||
    filters.severity || filters.status || filters.region || filters.startDate || filters.search;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#e6edf3', fontWeight: 700 }}>
            Audit Log Investigation
          </Title>
          <Text style={{ color: '#6e7681', fontSize: 13 }}>
            Deep-dive investigation view — full-screen log browser with all filters
          </Text>
        </div>
        <Space wrap>
          <Tooltip title="Reset all filters">
            <Button
              icon={<ClearOutlined />}
              onClick={handleResetFilters}
              disabled={!hasActiveFilters || loading}
            >
              Reset Filters
            </Button>
          </Tooltip>
          <Tooltip title="Export current page (strips internal fields)">
            <Button icon={<DownloadOutlined />} onClick={handleExportPage} disabled={!logs.length}>
              Export Page
            </Button>
          </Tooltip>
          <Tooltip title="Refresh logs">
            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              Refresh
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Quick Stats Row */}
      <Row gutter={[12, 12]}>
        {[
          { label: 'Total Matching', value: (pagination.totalDocs || 0).toLocaleString(), color: '#e6edf3' },
          { label: 'Current Page', value: `${pagination.currentPage} / ${pagination.totalPages}`, color: '#2f81f7' },
          { label: 'Per Page', value: pagination.limit, color: '#8b949e' },
          { label: 'Filters Active', value: hasActiveFilters ? 'Yes' : 'None', color: hasActiveFilters ? '#f97316' : '#6e7681' },
        ].map(({ label, value, color }) => (
          <Col key={label} xs={12} sm={6}>
            <Card styles={{ body: { padding: '12px 16px' } }}>
              <Statistic
                title={label}
                value={value}
                styles={{ content: { color, fontSize: 18, fontWeight: 700 } }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search */}
      <SearchBar onSearch={handleSearch} loading={loading} />

      {/* Filter Panel */}
      <div
        style={{
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <FilterOutlined style={{ color: '#2f81f7' }} />
          <Text style={{ fontWeight: 600, color: '#e6edf3', fontSize: 13 }}>Advanced Filters</Text>
          {hasActiveFilters && (
            <span style={{ background: '#2f81f7', color: '#fff', borderRadius: 10, fontSize: 11, padding: '0 6px', fontWeight: 600 }}>
              Active
            </span>
          )}
        </div>
        <Row gutter={[10, 10]}>
          {[
            { id: 'filter-al-role', placeholder: 'Role', field: 'role', options: toOptions(ROLES) },
            { id: 'filter-al-severity', placeholder: 'Severity', field: 'severity', options: toOptions(SEVERITY_LEVELS) },
            { id: 'filter-al-status', placeholder: 'Status', field: 'status', options: toOptions(STATUS_TYPES) },
            { id: 'filter-al-resourceType', placeholder: 'Resource Type', field: 'resourceType', options: toOptions(RESOURCE_TYPES) },
            { id: 'filter-al-region', placeholder: 'Region', field: 'region', options: toOptions(REGIONS), showSearch: true },
            { id: 'filter-al-action', placeholder: 'Action', field: 'action', options: toOptions(ACTIONS), showSearch: true },
          ].map(({ id, placeholder, field, options, showSearch }) => (
            <Col key={field} xs={24} sm={12} md={8} lg={4}>
              <Select
                id={id}
                placeholder={placeholder}
                options={options}
                value={filters[field]}
                onChange={(v) => handleFilterChange({ [field]: v || null })}
                allowClear
                showSearch={showSearch}
                style={{ width: '100%' }}
                disabled={loading}
              />
            </Col>
          ))}
          <Col xs={24} sm={24} md={24} lg={8}>
            <RangePicker
              id="filter-al-date-range"
              value={dateRangeValue}
              onChange={handleDateRange}
              style={{ width: '100%' }}
              disabled={loading}
              placeholder={['Start Date', 'End Date']}
              format="DD MMM YYYY"
              allowEmpty={[true, true]}
            />
          </Col>
        </Row>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          title="Failed to load audit logs"
          description={error}
          showIcon
          action={<Button size="small" onClick={refresh}>Retry</Button>}
          closable
        />
      )}

      {/* Table */}
      <div style={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
        <LogTable
          logs={logs}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          onSort={handleSort}
          onRefresh={refresh}
          filters={filters}
        />
      </div>

      {/* Detail Drawer */}
      <LogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setTimeout(() => setSelectedLog(null), 300);
        }}
      />
    </div>
  );
};

export default AuditLogsPage;
