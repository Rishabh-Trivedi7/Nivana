import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import ApiError from './utils/ApiError.js';

const app = express();

app.set('trust proxy', 1);

// ================= CORS =================

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ================= MIDDLEWARE =================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

// ================= ROOT ROUTE =================

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    application: 'Nivana Backend API',
    status: 'Running',
    version: '1.0.0',
    message: 'Welcome to the Nivana Backend API 🚀'
  });
});

// ================= HEALTH CHECK =================

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'Healthy',
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString()
  });
});

// ================= API ROUTES =================

app.use('/api', routes);

// ================= 404 HANDLER =================

app.use((_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// ================= GLOBAL ERROR HANDLER =================

app.use(errorHandler);

export default app;