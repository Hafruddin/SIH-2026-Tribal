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

// Enable CORS and JSON parsing
app.use(cors());
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

// Mount REST API endpoints
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    application: 'Tribal Scholar Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  TRIBAL SCHOLAR BACKEND API RUNNING ON PORT ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
