import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) return 'antd';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/axios') || id.includes('node_modules/dayjs')) return 'utils';
        },
      },
    },
  },
});
