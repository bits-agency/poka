export type AgreementState =
  | 'DRAFT'
  | 'NEGOTIATING'
  | 'AGREED'
  | 'ESCROWED'
  | 'MONITORING'
  | 'CONDITION_MET'
  | 'SETTLING'
  | 'SETTLED'
  | 'EXTENSION_REQUESTED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'FAILED';

export type AutonomyLevel = 'MANUAL' | 'ASSISTED' | 'AUTONOMOUS';

export interface PolicyPermissions {
  maxTransaction: number;
  maxNegotiation: number;
  canRequestExtension: boolean;
  canNegotiate: boolean;
  canReleaseFunds: boolean;
}

export interface ParsedAgreementInput {
  counterparty: string;
  counterpartyType: 'human' | 'agent';
  amount: number;
  currency: string;
  condition: string;
  deadline: string;
  escrowRequired: boolean;
  rawText: string;
  confidence: number;
  autonomyLevel: AutonomyLevel;
}

export interface Agreement {
  id: string;
  humanReadableId: string; // e.g. POKA-001
  initiator: string;
  counterparty: string;
  counterpartyType: 'human' | 'agent';
  amount: number;
  currency: string;
  condition: string;
  deadline: string;
  status: AgreementState;
  autonomyLevel: AutonomyLevel;
  escrowAddress?: string;
  escrowFunded: boolean;
  conditionSatisfied: boolean;
  celoTxHash?: string;
  negotiationHistory?: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface NegotiationMessage {
  id: string;
  sender: string;
  senderRole: 'buyer_agent' | 'seller_agent' | 'human_initiator' | 'human_counterparty';
  content: string;
  proposedAmount?: number;
  timestamp: string;
  isOffer?: boolean;
  isAccepted?: boolean;
}

export interface AgreementEvent {
  id: string;
  agreementId: string;
  type: string;
  message: string;
  timestamp: string;
  actor: 'SYSTEM' | 'POKA SENTINEL' | 'BUYER_AGENT' | 'SELLER_AGENT' | 'INITIATOR' | 'COUNTERPARTY' | 'CELO_NETWORK';
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  agreementId: string;
  humanReadableId: string;
  txHash: string;
  chain: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  type: 'ESCROW_DEPOSIT' | 'SETTLEMENT_RELEASE' | 'REFUND';
  from: string;
  to: string;
  createdAt: string;
  attributionTag?: string;
  blockNumber?: number;
}

export interface SentinelStatus {
  activeSentinelsCount: number;
  totalInEscrow: number;
  status: 'SYNCED' | 'MONITORING' | 'SETTLING';
  network: 'CELO_SEPOLIA' | 'CELO_MAINNET' | 'DEMO_SANDBOX';
}
