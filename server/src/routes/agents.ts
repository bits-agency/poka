import { Router } from 'express';
import { AgentNegotiator } from '../services/ai/negotiator.js';

export const agentsRouter = Router();

agentsRouter.get('/', (_req, res) => {
  res.json([
    {
      id: 'agent-buyer',
      name: 'POKA Buyer Agent',
      type: 'autonomous_delegated',
      status: 'ONLINE',
      address: '0x71C849B31A892F13210',
      reputation: 99.4,
      role: 'buyer',
      activeAgreements: 2,
    },
    {
      id: 'agent-seller',
      name: 'David Autonomous Agent',
      type: 'counterparty_delegated',
      status: 'ONLINE',
      address: '0x48911A7208C39F290B3',
      reputation: 98.1,
      role: 'seller',
      activeAgreements: 1,
    },
    {
      id: 'agent-research',
      name: 'Research Agent Alpha',
      type: 'autonomous_delegated',
      status: 'ONLINE',
      address: '0x7F941A9908B763198',
      reputation: 99.8,
      role: 'buyer',
      activeAgreements: 1,
    },
    {
      id: 'agent-data',
      name: 'Decentralized Data Oracle',
      type: 'autonomous_delegated',
      status: 'ONLINE',
      address: '0x3E190C9148E66219',
      reputation: 100.0,
      role: 'seller',
      activeAgreements: 1,
    }
  ]);
});

agentsRouter.post('/simulate-negotiation', (req, res) => {
  const { amount = 50, condition = 'Website delivered', deadline = '24 Hours' } = req.body;
  const result = AgentNegotiator.simulateNegotiation(amount, condition, deadline);
  res.json(result);
});
