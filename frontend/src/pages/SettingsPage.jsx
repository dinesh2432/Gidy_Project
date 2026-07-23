import { Card, Typography, Row, Col, Tag, Space, Divider, Switch, Select, Alert } from 'antd';
import {
  SafetyCertificateOutlined,
  BellOutlined,
  ApiOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SETTING_SECTIONS = [
  {
    icon: <BellOutlined style={{ color: '#2f81f7' }} />,
    title: 'Notifications',
    description: 'Configure alert thresholds and notification preferences',
    settings: [
      { label: 'Critical alerts', sublabel: 'Notify on CRITICAL severity events', defaultOn: true },
      { label: 'High alerts', sublabel: 'Notify on HIGH severity events', defaultOn: true },
      { label: 'Failed login alerts', sublabel: 'Notify on FAILED_LOGIN actions', defaultOn: false },
    ],
  },
  {
    icon: <DatabaseOutlined style={{ color: '#a78bfa' }} />,
    title: 'Data Retention',
    description: 'Control how long audit logs are stored',
    settings: [
      { label: 'Auto-archive logs', sublabel: 'Archive logs older than 90 days', defaultOn: false },
      { label: 'Compress old logs', sublabel: 'Compress logs older than 30 days', defaultOn: false },
    ],
  },
  {
    icon: <LockOutlined style={{ color: '#22c55e' }} />,
    title: 'Security',
    description: 'Configure security and access control settings',
    settings: [
      { label: 'Audit trail', sublabel: 'Log all dashboard access and exports', defaultOn: true },
      { label: 'IP allowlist', sublabel: 'Restrict access to specific IP ranges', defaultOn: false },
    ],
  },
];

/**
 * Settings page — configuration panel for the SecureLog dashboard.
 * Displays notification, retention, and security preference toggles.
 */
const SettingsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div>
        <Title level={3} style={{ margin: 0, color: '#e6edf3', fontWeight: 700 }}>
          Settings
        </Title>
        <Text style={{ color: '#6e7681', fontSize: 13 }}>
          Configure dashboard preferences, notifications, and security policies
        </Text>
      </div>

      <Alert
        type="info"
        showIcon
        title="Configuration stored locally"
        description="These preferences are stored in your browser session. Server-side configuration requires backend environment variables."
        style={{ borderRadius: 8 }}
      />

      <Row gutter={[16, 16]}>
        {/* General Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <GlobalOutlined style={{ color: '#2f81f7' }} />
                <span>General</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div>
                <Text style={{ color: '#8b949e', fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Default Page Size
                </Text>
                <Select
                  defaultValue="25"
                  style={{ width: '100%' }}
                  options={[
                    { label: '10 records per page', value: '10' },
                    { label: '25 records per page', value: '25' },
                    { label: '50 records per page', value: '50' },
                    { label: '100 records per page', value: '100' },
                  ]}
                />
              </div>
              <div>
                <Text style={{ color: '#8b949e', fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Default Sort Order
                </Text>
                <Select
                  defaultValue="desc"
                  style={{ width: '100%' }}
                  options={[
                    { label: 'Newest first (descending)', value: 'desc' },
                    { label: 'Oldest first (ascending)', value: 'asc' },
                  ]}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* API Info */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ApiOutlined style={{ color: '#f97316' }} />
                <span>API Configuration</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {[
                { label: 'API Base URL', value: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api' },
                { label: 'Max Upload Size', value: '10,000 records / request' },
                { label: 'Request Timeout', value: '120 seconds (uploads)' },
                { label: 'Pagination Max', value: '100 records / page' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #21262d' }}>
                  <Text style={{ color: '#8b949e', fontSize: 12 }}>{label}</Text>
                  <Text style={{ color: '#e6edf3', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{value}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Toggle Setting Sections */}
        {SETTING_SECTIONS.map((section) => (
          <Col key={section.title} xs={24} lg={12}>
            <Card
              title={
                <Space>
                  {section.icon}
                  <span>{section.title}</span>
                </Space>
              }
            >
              <Paragraph style={{ color: '#6e7681', fontSize: 12, marginBottom: 16 }}>
                {section.description}
              </Paragraph>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {section.settings.map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text style={{ color: '#e6edf3', fontSize: 13, display: 'block' }}>{s.label}</Text>
                      <Text style={{ color: '#6e7681', fontSize: 11 }}>{s.sublabel}</Text>
                    </div>
                    <Switch defaultChecked={s.defaultOn} />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        ))}

        {/* System Info */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#22c55e' }} />
                <span>System Information</span>
              </Space>
            }
          >
            <Row gutter={[24, 12]}>
              {[
                { label: 'Application', value: 'SecureLog v1.0.0' },
                { label: 'Frontend', value: 'React 19 + Vite 8 + Ant Design 5' },
                { label: 'Backend', value: 'Node.js + Express 5 + Mongoose 8' },
                { label: 'Database', value: 'MongoDB Atlas' },
                { label: 'Deployment', value: 'Vercel (FE) + Render (BE)' },
                { label: 'License', value: 'MIT' },
              ].map(({ label, value }) => (
                <Col key={label} xs={24} sm={12} md={8}>
                  <div>
                    <Text style={{ color: '#6e7681', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                      {label}
                    </Text>
                    <Text style={{ color: '#e6edf3', fontSize: 13 }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
