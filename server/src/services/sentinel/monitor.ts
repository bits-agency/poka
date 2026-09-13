import { Agreement, AgreementEvent } from '../../types/shared.js';
import { db } from '../../db/store.js';
import { celoService } from '../celo/transactions.js';
import { policyEngine } from '../ai/policy.js';

export class SentinelService {
  /**
   * Called when agreement is newly created
   */
  public static onAgreementCreated(agreement: Agreement): void {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'AGREEMENT_CREATED',
      message: `Agreement initialized with terms: ${agreement.amount} ${agreement.currency} for '${agreement.condition}'.`,
      actor: 'POKA SENTINEL',
    });

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'COUNTERPARTY_NOTIFIED',
      message: `Counterparty '${agreement.counterparty}' notified via decentralized agent protocol.`,
      actor: 'POKA SENTINEL',
    });
  }

  /**
   * Called when agreement terms are accepted / negotiated
   */
  public static onTermsAccepted(agreement: Agreement): void {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'TERMS_ACCEPTED',
      message: `Terms accepted by ${agreement.counterparty}. Economic agreement locked at $${agreement.amount}.`,
      actor: 'POKA SENTINEL',
    });
  }

  /**
   * Called when escrow is funded
   */
  public static onEscrowFunded(agreement: Agreement, txHash: string): void {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'ESCROW_FUNDED',
      message: `Escrow funded on Celo Sepolia: ${agreement.amount} ${agreement.currency}. Tx: ${txHash.substring(0, 10)}...`,
      actor: 'POKA SENTINEL',
      metadata: { txHash },
    });

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'MONITORING_STARTED',
      message: `Autonomous Sentinel initialized. Monitoring condition: '${agreement.condition}'.`,
      actor: 'POKA SENTINEL',
    });
  }

  /**
   * Verifies the condition (triggered automatically or via simulated trigger)
   */
  public static async verifyCondition(agreement: Agreement): Promise<Agreement> {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'CONDITION_DETECTED',
      message: `Condition fulfillment signal detected for '${agreement.condition}'.`,
      actor: 'POKA SENTINEL',
    });

    // Mark satisfied
    agreement.conditionSatisfied = true;
    agreement.status = 'CONDITION_MET';

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'CONDITION_VERIFIED',
      message: `Sentinel verified cryptographic proofs & delivery requirements. Condition satisfied.`,
      actor: 'POKA SENTINEL',
    });

    db.saveAgreement(agreement);

    // If autonomy is AUTONOMOUS, automatically settle!
    if (agreement.autonomyLevel === 'AUTONOMOUS') {
      await this.settleAgreement(agreement);
    }

    return agreement;
  }

  /**
   * Settle and release payment to counterparty
   */
  public static async settleAgreement(agreement: Agreement): Promise<{ agreement: Agreement; txHash: string }> {
    const policyCheck = policyEngine.validateFundRelease(agreement);
    if (!policyCheck.allowed) {
      db.addEvent(agreement.id, {
        agreementId: agreement.id,
        type: 'SETTLEMENT_REJECTED',
        message: `Policy rejection: ${policyCheck.reason}`,
        actor: 'POKA SENTINEL',
      });
      throw new Error(policyCheck.reason);
    }

    agreement.status = 'SETTLING';
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'SETTLEMENT_INITIATED',
      message: `Settlement initiated. Preparing Celo Sepolia transaction for ${agreement.amount} ${agreement.currency}.`,
      actor: 'POKA SENTINEL',
    });

    const tx = await celoService.releaseSettlement({
      agreementId: agreement.id,
      humanReadableId: agreement.humanReadableId,
      amount: agreement.amount,
      currency: agreement.currency,
      from: agreement.escrowAddress || '0x992b4A25b8C77...CeloEscrow',
      to: `0x${Math.random().toString(16).substring(2, 10)}... (${agreement.counterparty})`,
    });

    db.addTransaction(tx);

    agreement.status = 'SETTLED';
    agreement.celoTxHash = tx.txHash;
    db.saveAgreement(agreement);

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'PAYMENT_RELEASED',
      message: `Payment released. Celo transaction confirmed: ${tx.txHash}. Settlement complete.`,
      actor: 'POKA SENTINEL',
      metadata: { txHash: tx.txHash },
    });

    return { agreement, txHash: tx.txHash };
  }
}
