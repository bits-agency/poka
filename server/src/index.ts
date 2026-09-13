import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agreementsRouter } from './routes/agreements.js';
import { transactionsRouter } from './routes/transactions.js';
import { agentsRouter } from './routes/agents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agreements', agreementsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/agents', agentsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'POKA Autonomous Economic Agreement Agent',
    timestamp: new Date().toISOString(),
    network: process.env.DEMO_MODE === 'false' ? 'Celo Sepolia' : 'Demo Sandbox',
  });
});

app.listen(PORT, () => {
  console.log(`[POKA SERVER] Running on port ${PORT}`);
  console.log(`[POKA SERVER] Celo Network: ${process.env.DEMO_MODE === 'false' ? 'Celo Sepolia (Live)' : 'Demo Sandbox'}`);
});
