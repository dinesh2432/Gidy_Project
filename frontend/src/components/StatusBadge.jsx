import { Badge } from 'antd';

const STATUS_CONFIG = {
  Resolved: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: 'Resolved' },
  Unresolved: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', text: 'Unresolved' },
};

/**
 * Colored status badge.
 * @param {string} status - "Resolved" | "Unresolved"
 */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { color: '#8b949e', bg: 'rgba(139,148,158,0.12)', text: status };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 20,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        fontSize: 12,
        fontWeight: 600,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      <Badge
        color={config.color}
        style={{ marginBottom: 1 }}
      />
      {config.text}
    </span>
  );
};

export default StatusBadge;
