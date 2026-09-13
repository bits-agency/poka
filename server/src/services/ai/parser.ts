import { ParsedAgreementInput, AutonomyLevel } from '../../types/shared.js';

export class AgreementParser {
  /**
   * Parses natural language into a validated structured Agreement object.
   * Handles prompts such as:
   * "Pay David $50 when he delivers the website tomorrow."
   * "Send Research Agent 2 USDC once verified dataset is submitted."
   * "Pay Alice 100 CELO when smart contract audit is completed by Friday."
   */
  public static parse(prompt: string): ParsedAgreementInput {
    const text = prompt.trim();
    
    // Default fallback values
    let counterparty = 'Counterparty';
    let counterpartyType: 'human' | 'agent' = 'human';
    let amount = 50;
    let currency = 'USD';
    let condition = 'Deliverable completed and verified';
    let deadline = 'Tomorrow';
    let escrowRequired = true;
    let autonomyLevel: AutonomyLevel = 'ASSISTED';
    let confidence = 0.92;

    // 1. Extract Amount and Currency
    // Look for $50, 50 USD, 50 USDC, 50 CELO, 0.5 CELO
    const amountMatch = text.match(/(?:\$|€|£)?\s*([0-9]+(?:\.[0-9]+)?)\s*(USD|USDC|CELO|cUSD|dollars?)?/i);
    if (amountMatch) {
      const parsedVal = parseFloat(amountMatch[1]);
      if (!isNaN(parsedVal)) {
        amount = parsedVal;
      }
      if (text.includes('CELO') || text.includes('celo')) {
        currency = 'CELO';
      } else if (text.includes('USDC') || text.includes('usdc') || text.includes('cUSD')) {
        currency = 'USDC';
      } else {
        currency = 'USD';
      }
    }

    // 2. Extract Counterparty
    const counterpartyMatch = text.match(/(?:pay|send(?:\s+to)?|give|transfer(?:\s+to)?|hire)\s+([a-zA-Z0-9_\-\.\s]+?)(?=\s+(?:\$|[0-9]|when|if|once|for|to\s+deliver))/i);
    if (counterpartyMatch && counterpartyMatch[1]) {
      const extracted = counterpartyMatch[1].trim();
      if (!['usd', 'usdc', 'celo', 'dollars'].includes(extracted.toLowerCase())) {
        counterparty = extracted;
      }
    }

    if (counterparty.toLowerCase().includes('agent') || counterparty.toLowerCase().includes('bot') || counterparty.startsWith('0x')) {
      counterpartyType = 'agent';
    }

    // 3. Extract Condition
    const conditionMatch = text.match(/(?:when|if|once|after)\s+(.+?)(?=\s+(?:by|within|before|tomorrow|in\s+\d+|deadline)|$)/i);
    if (conditionMatch && conditionMatch[1]) {
      let rawCondition = conditionMatch[1].trim();
      if (rawCondition.toLowerCase().includes('delivers the website') || rawCondition.toLowerCase().includes('website is delivered')) {
        condition = 'Website delivered';
      } else if (rawCondition.toLowerCase().includes('audit') || rawCondition.toLowerCase().includes('contract')) {
        condition = 'Smart contract audit verified';
      } else if (rawCondition.toLowerCase().includes('dataset') || rawCondition.toLowerCase().includes('analytics')) {
        condition = 'Verified website analytics';
      } else {
        condition = rawCondition.charAt(0).toUpperCase() + rawCondition.slice(1);
      }
    }

    // 4. Extract Deadline
    const deadlineMatch = text.match(/(?:by|within|in|before)\s+([^,.]+)|(?:tomorrow)/i);
    if (deadlineMatch) {
      const matchedDeadline = deadlineMatch[0].trim();
      if (matchedDeadline.toLowerCase() === 'tomorrow') {
        deadline = 'Tomorrow';
      } else {
        deadline = matchedDeadline.charAt(0).toUpperCase() + matchedDeadline.slice(1);
      }
    }

    // 5. Autonomy Level check
    if (text.toLowerCase().includes('autonomous') || text.toLowerCase().includes('auto-execute')) {
      autonomyLevel = 'AUTONOMOUS';
    } else if (text.toLowerCase().includes('manual')) {
      autonomyLevel = 'MANUAL';
    } else {
      autonomyLevel = 'ASSISTED';
    }

    return {
      counterparty,
      counterpartyType,
      amount,
      currency,
      condition,
      deadline,
      escrowRequired,
      rawText: text,
      confidence,
      autonomyLevel,
    };
  }
}
