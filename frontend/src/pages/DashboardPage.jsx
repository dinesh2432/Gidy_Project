import { useState } from 'react';
import { Space, Button, Alert, Typography, Divider, Tooltip, message } from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import useLogs from '../hooks/useLogs.js';
import useStats from '../hooks/useStats.js';
import StatsCards from '../components/StatsCards.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LogFilters from '../components/LogFilters.jsx';
import LogTable from '../components/LogTable.jsx';
import UploadModal from '../components/UploadModal.jsx';
import LogDetailDrawer from '../components/LogDetailDrawer.jsx';

const { Title, Text } = Typography;

/**
 * Main dashboard page.
 * Orchestrates all sub-components and hooks.
 */
const DashboardPage = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Stats hook — independent refresh cycle
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();

  // Logs hook — manages all filter/pagination state
  const {
    logs,
    pagination,
    filters,
    loading: logsLoading,
    error: logsError,
    handlePageChange,
    handleFilterChange,
    handleResetFilters,
    handleSort,
    refresh: refreshLogs,
  } = useLogs(25);

  const handleSearch = (value) => {
    handleFilterChange({ search: value });
  };

  const handleRowClick = (record) => {
    setSelectedLog(record);
    setDrawerOpen(true);
  };

  const handleUploadSuccess = () => {
    message.success('Logs uploaded successfully! Refreshing data…');
    refreshLogs();
    refetchStats();
  };

  const handleExportJSON = () => {
    if (!logs.length) {
      message.warning('No logs on this page to export');
      return;
    }
    // Strip internal MongoDB fields so the exported file can be safely re-uploaded
    const exportData = logs.map(({ _id, __v, uploadBatch, createdAt, updatedAt, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_page${pagination.currentPage}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Exported ${logs.length} records (internal fields stripped)`);
  };

  const handleRefreshAll = () => {
    refreshLogs();
    refetchStats();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title
            level={3}
            style={{ margin: 0, color: '#e6edf3', fontWeight: 700 }}
          >
            Audit Log Dashboard
          </Title>
          <Text style={{ color: '#6e7681', fontSize: 13 }}>
            Investigate and analyze security events across your infrastructure
          </Text>
        </div>

        <Space wrap className="page-header-actions">
          <Tooltip title="Refresh all data">
            <Button
              id="refresh-all-btn"
              icon={<ReloadOutlined />}
              onClick={handleRefreshAll}
              loading={logsLoading || statsLoading}
            >
              Refresh
            </Button>
          </Tooltip>

          <Tooltip title="Export current page as JSON">
            <Button
              id="export-json-btn"
              icon={<DownloadOutlined />}
              onClick={handleExportJSON}
              disabled={!logs.length}
            >
              Export Page
            </Button>
          </Tooltip>

          <Button
            id="open-upload-modal-btn"
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Logs
          </Button>
        </Space>
      </div>

      {/* ── Statistics Cards ──────────────────────────────────── */}
      <StatsCards stats={stats} loading={statsLoading} />

      <Divider style={{ borderColor: '#21262d', margin: '0' }} />

      {/* ── Search ───────────────────────────────────────────── */}
      <SearchBar onSearch={handleSearch} loading={logsLoading} />

      {/* ── Filters ──────────────────────────────────────────── */}
      <LogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        loading={logsLoading}
      />

      {/* ── Error State ──────────────────────────────────────── */}
      {logsError && (
        <Alert
          type="error"
          title="Failed to load audit logs"
          description={logsError}
          showIcon
          action={
            <Button size="small" onClick={refreshLogs}>
              Retry
            </Button>
          }
          closable
        />
      )}

      {/* ── Data Table ───────────────────────────────────────── */}
      <div
        style={{
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <LogTable
          logs={logs}
          pagination={pagination}
          loading={logsLoading}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          onSort={handleSort}
          onRefresh={refreshLogs}
          filters={filters}
        />
      </div>

      {/* ── Upload Modal ──────────────────────────────────────── */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* ── Log Detail Drawer ─────────────────────────────────── */}
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

export default DashboardPage;
