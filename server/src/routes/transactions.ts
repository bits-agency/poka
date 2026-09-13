import { Router } from 'express';
import { db } from '../db/store.js';
import { celoService } from '../services/celo/transactions.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', (_req, res) => {
  res.json(db.getTransactions());
});

transactionsRouter.get('/network', (_req, res) => {
  res.json(celoService.getNetworkInfo());
});
