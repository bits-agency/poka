import { Agreement, AgreementEvent, Transaction, SentinelStatus } from '../types/shared.js';

class DataStore {
  private agreements: Map<string, Agreement> = new Map();
  private events: Map<string, AgreementEvent[]> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private counter: number = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Agreement #POKA-012: Research Agent -> Data Agent
    const a2: Agreement = {
      id: 'poka-012',
      humanReadableId: 'POKA-012',
      initiator: 'Research Agent (0x7F9...41a)',
      counterparty: 'Data Agent (0x3E1...90c)',
      counterpartyType: 'agent',
      amount: 2.0,
      currency: 'USDC',
      condition: 'Verified on-chain dataset delivery (CID: bafybeic...74)',
      deadline: '12 Hours',
      status: 'ESCROWED',
      autonomyLevel: 'AUTONOMOUS',
      escrowAddress: '0x8b32A1387D095fBf63c80F951478149A7cf79311',
      escrowFunded: true,
      conditionSatisfied: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    // Agreement #POKA-013: Alice -> Bob
    const a3: Agreement = {
      id: 'poka-013',
      humanReadableId: 'POKA-013',
      initiator: 'Alice (0x71C...49b)',
      counterparty: 'Bob (0x84C...01b)',
      counterpartyType: 'human',
      amount: 30.0,
      currency: 'USD',
      condition: 'Figma wireframes review and approval',
      deadline: '48 Hours',
      status: 'MONITORING',
      autonomyLevel: 'ASSISTED',
      escrowAddress: '0x5C49A2dE539744cb89d97B2cfD355152a5509930',
      escrowFunded: true,
      conditionSatisfied: false,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    };

    this.agreements.set(a2.id, a2);
    this.agreements.set(a3.id, a3);
    // User agreements will start at POKA-001!
    this.counter = 1;

    this.events.set(a2.id, [
      {
        id: 'ev-201',
        agreementId: a2.id,
        type: 'AGREEMENT_CREATED',
        message: 'Autonomous economic agreement created via agent handshake.',
        timestamp: a2.createdAt,
        actor: 'BUYER_AGENT',
      },
      {
        id: 'ev-202',
        agreementId: a2.id,
        type: 'ESCROW_FUNDED',
        message: '2 USDC locked into escrow contract on Celo Sepolia.',
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        actor: 'POKA SENTINEL',
      },
      {
        id: 'ev-203',
        agreementId: a2.id,
        type: 'MONITORING_ACTIVE',
        message: 'Sentinel monitoring IPFS data feed condition.',
        timestamp: a2.updatedAt,
        actor: 'POKA SENTINEL',
      }
    ]);

    this.events.set(a3.id, [
      {
        id: 'ev-301',
        agreementId: a3.id,
        type: 'AGREEMENT_CREATED',
        message: 'Agreement created: Alice -> Bob for $30 Figma wireframes.',
        timestamp: a3.createdAt,
        actor: 'INITIATOR',
      },
      {
        id: 'ev-302',
        agreementId: a3.id,
        type: 'ESCROW_FUNDED',
        message: '$30 deposited into escrow.',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        actor: 'SYSTEM',
      },
      {
        id: 'ev-303',
        agreementId: a3.id,
        type: 'MONITORING_ACTIVE',
        message: 'Sentinel waiting for design milestone approval.',
        timestamp: a3.updatedAt,
        actor: 'POKA SENTINEL',
      }
    ]);

    this.transactions.set('tx-201', {
      id: 'tx-201',
      agreementId: a2.id,
      humanReadableId: a2.humanReadableId,
      txHash: '0x8f23791a84f39e31d9e2908f912c9b4e12c418ef009a7b9319e34c910129a081',
      chain: 'Celo Sepolia (11142222)',
      amount: 2.0,
      currency: 'USDC',
      status: 'CONFIRMED',
      type: 'ESCROW_DEPOSIT',
      from: '0x7F9...41a',
      to: a2.escrowAddress!,
      createdAt: a2.createdAt,
      attributionTag: 'poka-agent-work-v1',
      blockNumber: 4210992,
    });
  }

  public getNextHumanReadableId(): string {
    const id = `POKA-${String(this.counter).padStart(3, '0')}`;
    this.counter++;
    return id;
  }

  public getAgreements(): Agreement[] {
    return Array.from(this.agreements.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getAgreement(id: string): Agreement | undefined {
    return this.agreements.get(id) || Array.from(this.agreements.values()).find(a => a.humanReadableId.toLowerCase() === id.toLowerCase());
  }

  public saveAgreement(agreement: Agreement): Agreement {
    agreement.updatedAt = new Date().toISOString();
    this.agreements.set(agreement.id, agreement);
    return agreement;
  }

  public addEvent(agreementId: string, event: Omit<AgreementEvent, 'id' | 'timestamp'>): AgreementEvent {
    const newEvent: AgreementEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    const list = this.events.get(agreementId) || [];
    list.push(newEvent);
    this.events.set(agreementId, list);
    return newEvent;
  }

  public getEvents(agreementId: string): AgreementEvent[] {
    return this.events.get(agreementId) || [];
  }

  public addTransaction(tx: Transaction): Transaction {
    this.transactions.set(tx.id, tx);
    return tx;
  }

  public getTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSentinelStatus(): SentinelStatus {
    const active = Array.from(this.agreements.values()).filter(
      a => a.status === 'ESCROWED' || a.status === 'MONITORING' || a.status === 'CONDITION_MET'
    );
    const totalEscrow = active.reduce((sum, a) => sum + (a.escrowFunded ? a.amount : 0), 3450);

    return {
      activeSentinelsCount: Math.max(active.length, 4),
      totalInEscrow: totalEscrow,
      status: 'SYNCED',
      network: process.env.DEMO_MODE === 'false' ? 'CELO_SEPOLIA' : 'DEMO_SANDBOX',
    };
  }
}

export const db = new DataStore();
