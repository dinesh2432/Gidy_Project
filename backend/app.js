import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import config from './config/config.js';
import logRoutes from './routes/logRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

const app = express();

// ─── Security — Helmet ────────────────────────────────────────────────────────
// Relaxed CSP: the API is consumed by a frontend SPA, not serving HTML.
// Full restrictive CSP would break nothing here but keeping it explicit.
app.use(
  helmet({
    contentSecurityPolicy: false, // API-only — no HTML served
    crossOriginEmbedderPolicy: false,
  })
);

// ─── Performance ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production, restrict to known frontend origins.
// In development, allow all origins for convenience.
const allowedOrigins = config.isDevelopment
  ? ['*']
  : [
      process.env.FRONTEND_URL,       // e.g. https://secure-log.vercel.app
      'http://localhost:3000',        // local dev fallback
      'http://localhost:5173',        // Vite default port fallback
    ].filter(Boolean);

app.use(
  cors({
    origin: config.isDevelopment
      ? '*'
      : (origin, callback) => {
          // Allow requests with no origin (mobile apps, Postman, Render health checks)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`CORS: Origin "${origin}" is not allowed`));
        },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// 50 MB limit supports full 10,000-record JSON uploads (~10–15 MB typical)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Security Audit Log API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/logs', logRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
