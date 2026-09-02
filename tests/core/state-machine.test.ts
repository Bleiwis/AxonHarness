import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StateMachine } from '../../src/core/state-machine.js';

describe('StateMachine', () => {
  let tempDir: string;
  let sm: StateMachine;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'axon-sm-test-'));
    sm = new StateMachine(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('initializes and saves configuration', () => {
    const config = sm.getConfig();
    expect(config.specsDir).toBe('specs/features');
    expect(config.tokenBudgetLimit).toBe(4000);

    sm.saveConfig({ tokenBudgetLimit: 8000 });
    expect(sm.getConfig().tokenBudgetLimit).toBe(8000);
  });

  it('starts a new feature in SDD phase', () => {
    const state = sm.startFeature('auth-jwt');
    expect(state.feature).toBe('auth-jwt');
    expect(state.phase).toBe('sdd');
    expect(state.status).toBe('in_progress');
    expect(state.activeSpec).toContain('auth-jwt.spec.md');

    const loaded = sm.getState();
    expect(loaded?.feature).toBe('auth-jwt');
  });

  it('advances through phases deterministically', () => {
    sm.startFeature('user-profile');
    
    // sdd -> bdd
    let res = sm.advancePhase('Spec completed');
    expect(res.success).toBe(true);
    expect(res.state?.phase).toBe('bdd');

    // bdd -> tdd_red
    res = sm.advancePhase('BDD extracted');
    expect(res.success).toBe(true);
    expect(res.state?.phase).toBe('tdd_red');

    // tdd_red -> tdd_green
    res = sm.advancePhase('Test written');
    expect(res.success).toBe(true);
    expect(res.state?.phase).toBe('tdd_green');

    // tdd_green -> refactor
    res = sm.advancePhase('Code implemented');
    expect(res.success).toBe(true);
    expect(res.state?.phase).toBe('refactor');

    // refactor -> verified
    res = sm.advancePhase('Refactoring done');
    expect(res.success).toBe(true);
    expect(res.state?.phase).toBe('verified');
    expect(res.state?.status).toBe('completed');

    // Cannot advance past verified
    res = sm.advancePhase();
    expect(res.success).toBe(false);
  });

  it('rolls back phase if needed', () => {
    sm.startFeature('payment-gateway');
    sm.advancePhase(); // -> bdd
    expect(sm.getState()?.phase).toBe('bdd');

    const res = sm.rollbackPhase('Need spec revision');
    expect(res.success).toBe(true);
    expect(res.state?.phase).toBe('sdd');
  });
});
