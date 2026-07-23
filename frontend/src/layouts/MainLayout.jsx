import { useState, useEffect, useCallback } from 'react';
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

// Breakpoint at which the sidebar becomes a mobile overlay drawer
const MOBILE_BREAKPOINT = 768;

const NAV_ITEMS = [
  { key: '/dashboard',  icon: <DashboardOutlined />,    label: 'Dashboard' },
  { key: '/audit-logs', icon: <SecurityScanOutlined />, label: 'Audit Logs' },
  { key: '/settings',   icon: <SettingOutlined />,      label: 'Settings' },
];

/**
 * Main application shell.
 *
 * Desktop (> 768px):
 *   - Persistent sidebar that can be collapsed to icon-only (64px) mode.
 *   - Content area shifts left/right with the sidebar width.
 *
 * Mobile (≤ 768px):
 *   - Sidebar slides fully off-screen when closed (transform: translateX(-100%)).
 *   - Opens as a full overlay with a dark backdrop.
 *   - Clicking the backdrop or a nav item closes it automatically.
 *   - Content always fills the full viewport width.
 */
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  // On mobile: "collapsed" means the sidebar is hidden (off-screen)
  // We track mobile-open state separately for clarity
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate  = useNavigate();

  // ── Detect mobile/desktop and react to window resize ──────────────────────
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile) {
      // Restore desktop state — close mobile overlay if it was open
      setMobileOpen(false);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedKey = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key || '/dashboard';

  // Desktop: sidebar takes real space → content shifts.
  // Mobile: sidebar overlays → content always margin-left 0.
  const contentMarginLeft = isMobile
    ? 0
    : collapsed ? 64 : 220;

  // On mobile the Sider should always appear at its full width (220px),
  // sliding in/out. On desktop it collapses to icon-only.
  const siderCollapsed = isMobile ? false : collapsed;

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const handleNavClick = (key) => {
    navigate(key);
    if (isMobile) setMobileOpen(false);
  };

  // ── Sidebar CSS class — mobile-open drives the slide animation via CSS ─────
  const siderClassName = isMobile && mobileOpen ? 'mobile-open' : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── Mobile backdrop ──────────────────────────────────────────────── */}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setMobileOpen(false)}
          style={{ display: 'block' }} // override CSS display:none
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Sider
        collapsible={!isMobile}
        collapsed={siderCollapsed}
        trigger={null}
        width={220}
        collapsedWidth={isMobile ? 0 : 64}
        className={siderClassName}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 200,
          // Desktop transition handled by AntD. Mobile transition via CSS class.
          transition: isMobile
            ? 'transform 0.25s ease'
            : 'width 0.2s ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: siderCollapsed ? '0 18px' : '0 20px',
            borderBottom: '1px solid #30363d',
            gap: 10,
            overflow: 'hidden',
            flexShrink: 0,
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
          {!siderCollapsed && (
            <div>
              <Text
                style={{
                  color: '#e6edf3',
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.2,
                  display: 'block',
                }}
              >
                SecureLog
              </Text>
              <Text style={{ color: '#6e7681', fontSize: 10, letterSpacing: '0.05em' }}>
                AUDIT DASHBOARD
              </Text>
            </div>
          )}
        </div>

        {/* Navigation menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => handleNavClick(item.key),
          }))}
          style={{ marginTop: 8, border: 'none' }}
        />

        {/* Version tag */}
        {!siderCollapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 54,
              left: 0,
              right: 0,
              padding: '8px 16px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Text style={{ color: '#6e7681', fontSize: 10 }}>v1.0.0 · Production</Text>
          </div>
        )}
      </Sider>

      {/* ── Main content area ────────────────────────────────────────────── */}
      <Layout
        style={{
          marginLeft: contentMarginLeft,
          transition: isMobile ? 'none' : 'margin-left 0.2s ease',
          minWidth: 0, // allow flex children to shrink
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
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
          <Space size={8}>
            {/* Hamburger / collapse toggle */}
            <Tooltip title={
              isMobile
                ? (mobileOpen ? 'Close menu' : 'Open menu')
                : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')
            }>
              <button
                id="sidebar-toggle-btn"
                onClick={handleToggle}
                aria-label="Toggle sidebar"
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
                  flexShrink: 0,
                }}
              >
                {isMobile
                  ? (mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />)
                  : (collapsed  ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)
                }
              </button>
            </Tooltip>

            {/* App title — hidden on very small screens via CSS class */}
            <Text className="header-subtitle" style={{ color: '#8b949e', fontSize: 13 }}>
              Security Audit Log Dashboard
            </Text>
          </Space>

          {/* Status badge — hidden on mobile via CSS class */}
          <Space size={16}>
            <Badge dot color="#22c55e">
              <Text className="header-status-text" style={{ color: '#6e7681', fontSize: 12 }}>
                System Status: Operational
              </Text>
            </Badge>
          </Space>
        </Header>

        {/* ── Page Content ──────────────────────────────────────────────── */}
        <Content
          style={{
            padding: 'var(--content-padding)',
            minHeight: 'calc(100vh - var(--header-height))',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
