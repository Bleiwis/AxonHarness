import pc from 'picocolors';
import { StateMachine } from '../../core/state-machine.js';
import { executePhaseVerification } from './verify.js';

export function runNext(options: { force?: boolean; reason?: string }): void {
  const baseDir = process.cwd();
  const sm = new StateMachine(baseDir);
  const state = sm.getState();

  if (!state) {
    console.error(pc.red('Error: No active feature found. Run `axon new <feature>` first.'));
    process.exit(1);
  }

  // If not forced, run verification gate first
  if (!options.force) {
    const { result } = executePhaseVerification(baseDir);
    if (!result.passed) {
      console.error(pc.bold(pc.red(`\n⛔ Cannot advance phase: ${result.message}`)));
      if (result.details) {
        console.error(pc.yellow(`   ${result.details}`));
      }
      console.error(pc.gray('\n   Tip: Fix the requirement or use ') + pc.cyan('axon next --force') + pc.gray(' to override.\n'));
      process.exit(1);
    }
  } else {
    console.log(pc.yellow('⚠️  Forcing phase advancement without verification check...'));
  }

  const previousPhase = state.phase;
  const advanceResult = sm.advancePhase(options.reason);

  if (!advanceResult.success || !advanceResult.state) {
    console.error(pc.red(`\nError: ${advanceResult.error || 'Failed to advance phase.'}`));
    process.exit(1);
  }

  const newState = advanceResult.state;
  console.log(pc.bold(pc.green(`\n🚀 Advanced Feature '${newState.feature}' from ${pc.yellow(previousPhase.toUpperCase())} ➔ ${pc.cyan(newState.phase.toUpperCase())}`)));

  if (newState.phase === 'verified') {
    console.log(pc.bold(pc.magenta('\n🎉 Feature lifecycle completed! All gates satisfied.')));
  } else {
    console.log(pc.gray('\n   Generate updated context for AI with: ') + pc.cyan('axon context\n'));
  }
}
