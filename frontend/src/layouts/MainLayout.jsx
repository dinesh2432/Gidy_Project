import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Space, Tooltip, Badge } from 'antd';
import {
  DashboardOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BugOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/audit-logs',
    icon: <SecurityScanOutlined />,
    label: 'Audit Logs',
    disabled: true,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    disabled: true,
  },
];

/**
 * Main application shell with collapsible sidebar and top header.
 * Uses React Router's <Outlet /> to render page content.
 */
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        collapsedWidth={64}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          transition: 'width 0.2s ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 18px' : '0 20px',
            borderBottom: '1px solid #30363d',
            gap: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2f81f7, #1d6fd8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(47,129,247,0.4)',
            }}
          >
            <BugOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          {!collapsed && (
            <div>
              <Text style={{ color: '#e6edf3', fontWeight: 700, fontSize: 14, lineHeight: 1.2, display: 'block' }}>
                SecureLog
              </Text>
              <Text style={{ color: '#6e7681', fontSize: 10, letterSpacing: '0.05em' }}>
                AUDIT DASHBOARD
              </Text>
            </div>
          )}
        </div>

        {/* Nav */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS.map((item) => ({
            ...item,
            label: item.label,
            onClick: !item.disabled ? () => navigate(item.key) : undefined,
          }))}
          style={{ marginTop: 8, border: 'none' }}
        />

        {/* Version tag */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 54,
              left: 0,
              right: 0,
              padding: '8px 16px',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#6e7681', fontSize: 10 }}>v1.0.0 · Production</Text>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.2s ease' }}>
        {/* ── Header ──────────────────────────────────────────── */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <button
                id="sidebar-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  background: 'none',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#8b949e',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </Tooltip>
            <Text style={{ color: '#8b949e', fontSize: 13 }}>
              Security Audit Log Dashboard
            </Text>
          </Space>

          <Space size={16}>
            <Badge
              dot
              color="#22c55e"
              title="All systems operational"
            >
              <Text style={{ color: '#6e7681', fontSize: 12 }}>
                System Status: Operational
              </Text>
            </Badge>
          </Space>
        </Header>

        {/* ── Page Content ─────────────────────────────────────── */}
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
