import { Row, Col, Card, Statistic, Skeleton } from 'antd';
import {
  DatabaseOutlined,
  WarningOutlined,
  FireOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { formatNumber } from '../utils/formatters.js';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Logs',
    icon: <DatabaseOutlined />,
    iconColor: '#2f81f7',
    iconBg: 'rgba(47,129,247,0.15)',
    valueColor: '#e6edf3',
  },
  {
    key: 'critical',
    label: 'Critical',
    icon: <ThunderboltOutlined />,
    iconColor: '#b91c1c',
    iconBg: 'rgba(185,28,28,0.18)',
    valueColor: '#b91c1c',
  },
  {
    key: 'high',
    label: 'High',
    icon: <FireOutlined />,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.18)',
    valueColor: '#ef4444',
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: <WarningOutlined />,
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.18)',
    valueColor: '#f97316',
  },
  {
    key: 'low',
    label: 'Low',
    icon: <InfoCircleOutlined />,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.18)',
    valueColor: '#22c55e',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: <CheckCircleOutlined />,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    valueColor: '#22c55e',
  },
  {
    key: 'unresolved',
    label: 'Unresolved',
    icon: <CloseCircleOutlined />,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    valueColor: '#ef4444',
  },
  {
    key: 'todayUploads',
    label: "Today's Uploads",
    icon: <UploadOutlined />,
    iconColor: '#a78bfa',
    iconBg: 'rgba(167,139,250,0.15)',
    valueColor: '#a78bfa',
  },
];

/**
 * Dashboard statistics cards section.
 * @param {object|null} stats - Statistics data from useStats hook
 * @param {boolean} loading - Loading state
 */
const StatsCards = ({ stats, loading }) => {
  return (
    <Row gutter={[12, 12]}>
      {STAT_CARDS.map((card) => (
        <Col key={card.key} xs={12} sm={8} md={6} lg={6} xl={3}>
          <Card
            className="stat-card"
            style={{ height: '100%' }}
            styles={{ body: { padding: '16px' } }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: card.iconColor,
                  }}
                >
                  {card.icon}
                </div>
                <Statistic
                  title={card.label}
                  value={formatNumber(stats?.[card.key] ?? 0)}
                  styles={{
                    content: {
                      color: card.valueColor,
                      fontSize: 22,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
