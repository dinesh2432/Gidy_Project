import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import './index.css';
import App from './App.jsx';

const antdDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2f81f7',
    colorBgBase: '#0d1117',
    colorBgContainer: '#1c2128',
    colorBgElevated: '#161b22',
    colorBorder: '#30363d',
    colorText: '#e6edf3',
    colorTextSecondary: '#8b949e',
    borderRadius: 8,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
  },
  components: {
    Table: {
      headerBg: '#161b22',
      rowHoverBg: '#21262d',
      borderColor: '#30363d',
    },
    Card: {
      paddingLG: 20,
    },
    Modal: {
      contentBg: '#1c2128',
      headerBg: '#161b22',
    },
    Drawer: {
      colorBgElevated: '#1c2128',
    },
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={antdDarkTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
