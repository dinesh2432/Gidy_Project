import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDatabase from './database/connection.js';
import config from './config/config.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`\n🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
      console.log(`📡 Health: http://localhost:${config.port}/health`);
      console.log(`📋 API:    http://localhost:${config.port}/api/logs\n`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Promise Rejection:', reason);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
