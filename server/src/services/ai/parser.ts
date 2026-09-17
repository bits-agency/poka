import { ParsedAgreementInput, AutonomyLevel } from '../../types/shared.js';

export class AgreementParser {
  /**
   * Parses natural language into a validated structured Agreement object.
   * If GEMINI_API_KEY is available, leverages Google Gemini 2.0.
   * Otherwise, seamlessly falls back to high-accuracy deterministic heuristics.
   */
  public static async parse(prompt: string): Promise<ParsedAgreementInput> {
    const text = prompt.trim();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (apiKey) {
      try {
        const aiParsed = await this.parseWithGemini(text, apiKey);
        if (aiParsed) {
          return aiParsed;
        }
      } catch (err) {
        console.warn('[AI PARSER] Gemini API error, falling back to deterministic parser:', (err as Error)?.message);
      }
    }

    return this.parseDeterministic(text);
  }

  /**
   * High-intelligence LLM parsing using Google Gemini 2.0 Flash
   */
  private static async parseWithGemini(text: string, apiKey: string): Promise<ParsedAgreementInput | null> {
    const systemInstruction = `You are POKA's Economic Agreement Parser on Celo.
Extract the structured economic agreement from the user's natural language input.
Return strictly valid JSON conforming to this schema:
{
  "counterparty": "string (e.g. David, Research Agent, Auditor)",
  "counterpartyType": "human" | "agent",
  "amount": number,
  "currency": "USD" | "USDC" | "CELO" | "cUSD",
  "condition": "string (e.g. Website delivered, Data verified)",
  "deadline": "string (e.g. Tomorrow, 48 Hours, 2026-09-25)",
  "escrowRequired": boolean,
  "autonomyLevel": "MANUAL" | "ASSISTED" | "AUTONOMOUS",
  "confidence": number between 0.8 and 0.99
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Input: "${text}"` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const json: any = await response.json();
    const rawContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent);

    return {
      counterparty: parsed.counterparty || 'Counterparty',
      counterpartyType: parsed.counterpartyType === 'agent' ? 'agent' : 'human',
      amount: typeof parsed.amount === 'number' ? parsed.amount : 50,
      currency: ['USD', 'USDC', 'CELO', 'cUSD'].includes(parsed.currency) ? parsed.currency : 'USD',
      condition: parsed.condition || 'Deliverable completed and verified',
      deadline: parsed.deadline || 'Tomorrow',
      escrowRequired: parsed.escrowRequired !== false,
      rawText: text,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.96,
      autonomyLevel: ['MANUAL', 'ASSISTED', 'AUTONOMOUS'].includes(parsed.autonomyLevel)
        ? parsed.autonomyLevel
        : 'ASSISTED',
    };
  }

  /**
   * Deterministic zero-dependency regex extractor
   */
  public static parseDeterministic(text: string): ParsedAgreementInput {
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
