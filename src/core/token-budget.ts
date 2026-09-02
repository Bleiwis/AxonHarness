/**
 * Token Budget Manager
 * Provides fast static estimation of tokens and computes savings from AST extraction.
 */

export interface TokenEstimation {
  characterCount: number;
  wordCount: number;
  estimatedTokens: number;
}

export interface CompressionReport {
  originalTokens: number;
  compressedTokens: number;
  tokensSaved: number;
  savingsPercentage: number;
}

export class TokenBudgetManager {
  /**
   * Fast rule-of-thumb token estimator for code and markdown.
   * On average in TypeScript/Markdown: ~3.7 characters per token.
   */
  static estimateTokens(text: string): TokenEstimation {
    if (!text) {
      return { characterCount: 0, wordCount: 0, estimatedTokens: 0 };
    }

    const characterCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    
    // Code with symbols usually yields more tokens than pure English prose.
    const estimatedTokens = Math.ceil(characterCount / 3.7);

    return {
      characterCount,
      wordCount,
      estimatedTokens
    };
  }

  /**
   * Calculates token compression savings comparing raw code vs type skeleton.
   */
  static computeSavings(originalText: string, compressedText: string): CompressionReport {
    const orig = this.estimateTokens(originalText).estimatedTokens;
    const comp = this.estimateTokens(compressedText).estimatedTokens;
    const saved = Math.max(0, orig - comp);
    const savingsPercentage = orig > 0 ? Math.round((saved / orig) * 100) : 0;

    return {
      originalTokens: orig,
      compressedTokens: comp,
      tokensSaved: saved,
      savingsPercentage
    };
  }

  /**
   * Checks if an estimated prompt exceeds the configured budget.
   */
  static isWithinBudget(estimatedTokens: number, budgetLimit: number = 4000): boolean {
    return estimatedTokens <= budgetLimit;
  }
}
