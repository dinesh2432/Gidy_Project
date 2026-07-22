import { Tag } from 'antd';

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#b91c1c', bg: 'rgba(185,28,28,0.18)', label: 'CRITICAL' },
  HIGH: { color: '#ef4444', bg: 'rgba(239,68,68,0.18)', label: 'HIGH' },
  MEDIUM: { color: '#f97316', bg: 'rgba(249,115,22,0.18)', label: 'MEDIUM' },
  LOW: { color: '#22c55e', bg: 'rgba(34,197,94,0.18)', label: 'LOW' },
};

/**
 * Colored severity tag with dot indicator.
 * @param {string} severity - CRITICAL | HIGH | MEDIUM | LOW
 */
const SeverityTag = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || { color: '#8b949e', bg: 'rgba(139,148,158,0.18)', label: severity };

  return (
    <Tag
      style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        padding: '2px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {config.label}
    </Tag>
  );
};

export default SeverityTag;
