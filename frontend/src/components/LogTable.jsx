import { useState } from 'react';
import { Table, Tooltip, Typography, Space, Tag, Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import SeverityTag from './SeverityTag.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatTimestamp, truncate } from '../utils/formatters.js';
import { PAGE_SIZE_OPTIONS } from '../constants/index.js';

const { Text } = Typography;

/**
 * Main data table component.
 * Handles column definitions, sorting events, pagination events.
 * All data operations are server-side — this component only renders.
 *
 * @param {Array} logs - Log records for current page
 * @param {object} pagination - { currentPage, totalPages, totalDocs, limit }
 * @param {boolean} loading - Loading state
 * @param {function} onPageChange - Called with (page, pageSize)
 * @param {function} onRowClick - Called with selected log object
 * @param {function} onSort - Called with (field, order)
 * @param {function} onRefresh - Refresh current page
 * @param {object} filters - Current filters (for sort highlight)
 */
const LogTable = ({
  logs,
  pagination,
  loading,
  onPageChange,
  onRowClick,
  onSort,
  onRefresh,
  filters,
}) => {
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  const handleTableChange = (paginationInfo, _filters, sorter) => {
    if (sorter?.field && sorter?.order) {
      const order = sorter.order === 'ascend' ? 'asc' : 'desc';
      onSort(sorter.field, order);
    }
    onPageChange(paginationInfo.current, paginationInfo.pageSize);
  };

  const columns = [
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
      sorter: true,
      width: 200,
      render: (actor) => (
        <Tooltip title={actor}>
          <Text
            style={{
              color: '#2f81f7',
              fontWeight: 500,
              fontSize: 12,
              maxWidth: 190,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {actor}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role) => (
        <Tag
          style={{
            background: 'rgba(139,148,158,0.15)',
            color: '#8b949e',
            border: 'none',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      sorter: true,
      width: 170,
      render: (action) => (
        <Tooltip title={action}>
          <Text
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#a78bfa',
              fontWeight: 500,
            }}
          >
            {action}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 180,
      render: (resource) => (
        <Tooltip title={resource}>
          <Text
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#8b949e',
              maxWidth: 170,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {resource}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'resourceType',
      key: 'resourceType',
      width: 110,
      render: (type) => (
        <Text style={{ fontSize: 12, color: '#6e7681' }}>{type}</Text>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (ip) => (
        <Text
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#8b949e',
          }}
        >
          {ip}
        </Text>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      sorter: true,
      width: 130,
      render: (region) => (
        <Text
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#6e7681',
          }}
        >
          {region}
        </Text>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      sorter: true,
      width: 110,
      render: (severity) => <SeverityTag severity={severity} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: true,
      defaultSortOrder: filters?.sortBy === 'timestamp' && filters?.sortOrder === 'asc' ? 'ascend' : 'descend',
      width: 175,
      render: (ts) => (
        <Text style={{ fontSize: 12, color: '#8b949e', whiteSpace: 'nowrap' }}>
          {formatTimestamp(ts)}
        </Text>
      ),
    },
  ];

  const antPagination = {
    current: pagination.currentPage,
    pageSize: pagination.limit,
    total: pagination.totalDocs,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showTotal: (total, range) => (
      <span style={{ color: '#8b949e', fontSize: 12 }}>
        {range[0]}–{range[1]} of {total.toLocaleString()} logs
      </span>
    ),
    style: { padding: '12px 16px' },
  };

  return (
    <div>
      {/* Table toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Space>
          <Text style={{ color: '#8b949e', fontSize: 12 }}>
            {loading
              ? 'Loading…'
              : `${(pagination.totalDocs || 0).toLocaleString()} total records`}
          </Text>
        </Space>
        <Tooltip title="Refresh">
          <Button
            id="refresh-table-btn"
            icon={<ReloadOutlined spin={loading} />}
            size="small"
            onClick={onRefresh}
            disabled={loading}
          />
        </Tooltip>
      </div>

      <Table
        id="audit-log-table"
        dataSource={logs}
        columns={columns}
        rowKey={(record) => record._id}
        loading={{
          spinning: loading,
          description: 'Loading audit logs…',
        }}
        onChange={handleTableChange}
        pagination={antPagination}
        scroll={{ x: 1300, y: 'calc(100vh - 480px)' }}
        sticky
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKey(record._id);
            onRowClick(record);
          },
          className: 'table-row-clickable',
        })}
        rowClassName={(record) =>
          record._id === selectedRowKey ? 'ant-table-row-selected' : ''
        }
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#6e7681' }}>
                  No audit logs found matching your filters
                </span>
              }
            />
          ),
        }}
      />
    </div>
  );
};

export default LogTable;
