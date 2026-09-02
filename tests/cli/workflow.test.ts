import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StateMachine } from '../../src/core/state-machine.js';
import { PromptCompiler } from '../../src/compressor/prompt-compiler.js';
import { SpecVerifier } from '../../src/verifier/spec-verifier.js';

describe('Axon Workflow Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'axon-integration-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('runs complete lifecycle from SDD to TDD', () => {
    const sm = new StateMachine(tempDir);
    const compiler = new PromptCompiler(tempDir);
    const specVerifier = new SpecVerifier(tempDir);

    // 1. Initialize feature
    const state = sm.startFeature('auth-jwt');
    expect(state.phase).toBe('sdd');

    // 2. Create Spec content
    const specFullPath = path.join(tempDir, state.activeSpec!);
    fs.mkdirSync(path.dirname(specFullPath), { recursive: true });
    fs.writeFileSync(
      specFullPath,
      '# Auth JWT Spec\n## Problem\nValidate user JWT tokens.\n## User Stories\n- US-01: Login with JWT token.',
      'utf8'
    );

    // 3. Verify SDD
    const sddVerification = specVerifier.verifySdd(sm.getState()!);
    expect(sddVerification.passed).toBe(true);

    // 4. Compile SDD Prompt
    const sddContext = compiler.compile(sm.getState()!);
    expect(sddContext.prompt).toContain('Objective: Formal Specification (SDD)');
    expect(sddContext.report.compressedTokens).toBeGreaterThan(0);

    // 5. Advance to BDD
    sm.advancePhase();
    expect(sm.getState()?.phase).toBe('bdd');

    // 6. Create BDD Feature
    const bddFullPath = path.join(tempDir, state.activeBdd!);
    fs.mkdirSync(path.dirname(bddFullPath), { recursive: true });
    fs.writeFileSync(
      bddFullPath,
      'Feature: JWT Authentication\n  Scenario: Valid token login\n    Given a valid JWT token\n    When decoded\n    Then return authorized',
      'utf8'
    );

    // 7. Verify BDD
    const bddVerification = specVerifier.verifyBdd(sm.getState()!);
    expect(bddVerification.passed).toBe(true);

    // 8. Compile BDD Context (shows spec criteria for writing BDD)
    const bddContext = compiler.compile(sm.getState()!);
    expect(bddContext.prompt).toContain('Objective: Behavior Specification (BDD)');
    expect(bddContext.prompt).toContain('Active Specification');

    // 9. Advance to TDD Red
    sm.advancePhase();
    expect(sm.getState()?.phase).toBe('tdd_red');

    // 10. Compile TDD Red Context (shows BDD scenario for writing tests)
    const redContext = compiler.compile(sm.getState()!);
    expect(redContext.prompt).toContain('Objective: Write Failing Test (TDD Red)');
    expect(redContext.prompt).toContain('Feature: JWT Authentication');
  });
});
