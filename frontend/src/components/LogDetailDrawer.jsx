import { Drawer, Descriptions, Space, Typography, Button, Divider, message, Tooltip, Tag } from 'antd';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import SeverityTag from './SeverityTag.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatTimestamp, formatRelativeTime, copyToClipboard } from '../utils/formatters.js';

const { Text } = Typography;

const DescItem = ({ label, children }) => (
  <Descriptions.Item label={<span style={{ color: '#8b949e', fontSize: 12 }}>{label}</span>}>
    {children}
  </Descriptions.Item>
);

/**
 * Side drawer showing full details of a selected log record.
 *
 * @param {object|null} log - The selected log object
 * @param {boolean} open - Drawer visibility
 * @param {function} onClose - Close callback
 */
const LogDetailDrawer = ({ log, open, onClose }) => {
  if (!log) return null;

  const handleCopyJson = async () => {
    try {
      await copyToClipboard(JSON.stringify(log, null, 2));
      message.success('Log JSON copied to clipboard');
    } catch {
      message.error('Failed to copy to clipboard');
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <span style={{ color: '#8b949e', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {log._id}
          </span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={520}
      closeIcon={<CloseOutlined style={{ color: '#8b949e' }} />}
      extra={
        <Tooltip title="Copy as JSON">
          <Button
            id="copy-log-json-btn"
            icon={<CopyOutlined />}
            size="small"
            onClick={handleCopyJson}
          >
            Copy JSON
          </Button>
        </Tooltip>
      }
    >
      {/* Header summary */}
      <div
        style={{
          background: '#0d1117',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          border: '1px solid #30363d',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <Text style={{ color: '#8b949e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Actor
          </Text>
          <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 15, marginTop: 2 }}>
            {log.actor}
          </div>
        </div>
        <Space size={8} wrap>
          <SeverityTag severity={log.severity} />
          <StatusBadge status={log.status} />
          <Tag
            style={{
              background: 'rgba(47,129,247,0.15)',
              color: '#2f81f7',
              border: '1px solid rgba(47,129,247,0.3)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            {log.action}
          </Tag>
        </Space>
      </div>

      <Descriptions
        column={1}
        size="small"
        bordered
        labelStyle={{
          background: '#161b22',
          width: 130,
          fontSize: 12,
        }}
        contentStyle={{
          background: '#1c2128',
          fontSize: 13,
          color: '#e6edf3',
        }}
      >
        <DescItem label="Role">
          <Tag style={{ background: 'rgba(139,148,158,0.15)', color: '#8b949e', border: 'none', fontSize: 11, fontWeight: 600 }}>
            {log.role}
          </Tag>
        </DescItem>

        <DescItem label="Resource">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.resource}</span>
        </DescItem>

        <DescItem label="Resource Type">
          {log.resourceType}
        </DescItem>

        <DescItem label="IP Address">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.ipAddress}</span>
        </DescItem>

        <DescItem label="Region">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.region}</span>
        </DescItem>

        <DescItem label="Timestamp">
          <div>
            <div style={{ color: '#e6edf3' }}>{formatTimestamp(log.timestamp)}</div>
            <div style={{ color: '#6e7681', fontSize: 11 }}>{formatRelativeTime(log.timestamp)}</div>
          </div>
        </DescItem>
      </Descriptions>

      <Divider style={{ borderColor: '#30363d', margin: '20px 0 16px' }} />

      {/* Raw JSON */}
      <Text style={{ color: '#8b949e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Raw JSON
      </Text>
      <pre
        style={{
          marginTop: 8,
          padding: 14,
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 8,
          fontSize: 11,
          color: '#79c0ff',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
        }}
      >
        {JSON.stringify(log, null, 2)}
      </pre>
    </Drawer>
  );
};

export default LogDetailDrawer;
