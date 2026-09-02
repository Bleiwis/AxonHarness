import pc from 'picocolors';
import { StateMachine } from '../../core/state-machine.js';
import { SpecVerifier } from '../../verifier/spec-verifier.js';
import { RedVerifier } from '../../verifier/red-verifier.js';
import { GreenVerifier } from '../../verifier/green-verifier.js';
import { VerificationResult } from '../../verifier/red-verifier.js';

export function executePhaseVerification(baseDir: string = process.cwd()): { result: VerificationResult; phase: string } {
  const sm = new StateMachine(baseDir);
  const state = sm.getState();

  if (!state) {
    return {
      result: {
        passed: false,
        message: 'No active Axon state found. Run `axon new <feature>` first.'
      },
      phase: 'none'
    };
  }

  const specVerifier = new SpecVerifier(baseDir);
  const redVerifier = new RedVerifier(baseDir);
  const greenVerifier = new GreenVerifier(baseDir);

  switch (state.phase) {
    case 'sdd':
      return { result: specVerifier.verifySdd(state), phase: state.phase };
    case 'bdd':
      return { result: specVerifier.verifyBdd(state), phase: state.phase };
    case 'tdd_red':
      return { result: redVerifier.verify(state), phase: state.phase };
    case 'tdd_green':
    case 'refactor':
    case 'verified':
      return { result: greenVerifier.verify(state), phase: state.phase };
  }
}

export function runVerify(): void {
  const baseDir = process.cwd();
  const sm = new StateMachine(baseDir);
  const state = sm.getState();

  if (!state) {
    console.error(pc.red('Error: No active feature found. Run `axon new <feature>` first.'));
    process.exit(1);
  }

  console.log(pc.bold(pc.cyan(`\n🔍 Verifying Phase: ${pc.yellow(state.phase.toUpperCase())} (Feature: ${pc.yellow(state.feature)})\n`)));

  const { result } = executePhaseVerification(baseDir);

  if (result.passed) {
    console.log(pc.bold(pc.green(result.message)));
    if (result.details) {
      console.log(pc.gray(result.details));
    }
    console.log(pc.green('\n✅ Gate passed! You can proceed to the next phase with: ') + pc.cyan('axon next\n'));
  } else {
    console.log(pc.bold(pc.red(result.message)));
    if (result.details) {
      console.log(pc.yellow(`\n${result.details}`));
    }
    console.log(pc.red('\n❌ Gate failed. Address the issues above before advancing.\n'));
    process.exit(1);
  }
}
