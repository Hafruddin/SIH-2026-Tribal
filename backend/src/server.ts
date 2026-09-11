import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes';
import db, { initDb } from './db/database';
import { seedDatabase } from './seed/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed CORS origins (Netlify production + local development)
const allowedOrigins = [
  'https://tribalscholarship.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during SIH prototype demonstration
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Initialize database schema and auto-seed if empty
initDb();
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
if (!userCount || userCount.count === 0) {
  console.log('Database empty. Seeding initial demo data...');
  seedDatabase();
}

// Health check endpoints
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    ok: true,
    status: 'OK',
    application: 'Tribal Scholar Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount REST API endpoints
app.use('/api', apiRouter);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  TRIBAL SCHOLAR BACKEND API RUNNING ON PORT ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
