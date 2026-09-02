import { describe, it, expect } from 'vitest';
import { TokenBudgetManager } from '../../src/core/token-budget.js';

describe('TokenBudgetManager', () => {
  it('estimates tokens correctly', () => {
    const text = 'function authenticateUser(token: string): boolean { return true; }';
    const est = TokenBudgetManager.estimateTokens(text);
    expect(est.characterCount).toBe(text.length);
    expect(est.estimatedTokens).toBeGreaterThan(10);
    expect(est.estimatedTokens).toBeLessThan(30);
  });

  it('computes compression savings percentage', () => {
    const rawCode = `
      // 500 lines of implementation logic...
      function bigAlgorithm() {
        let a = 1;
        for (let i = 0; i < 1000; i++) {
          a += i;
        }
        return a;
      }
    `;
    const compressed = 'declare function bigAlgorithm(): number;';

    const report = TokenBudgetManager.computeSavings(rawCode, compressed);
    expect(report.originalTokens).toBeGreaterThan(report.compressedTokens);
    expect(report.tokensSaved).toBeGreaterThan(0);
    expect(report.savingsPercentage).toBeGreaterThan(50);
  });

  it('validates budget limits', () => {
    expect(TokenBudgetManager.isWithinBudget(2000, 4000)).toBe(true);
    expect(TokenBudgetManager.isWithinBudget(5000, 4000)).toBe(false);
  });
});
