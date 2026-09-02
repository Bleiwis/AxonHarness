import pc from 'picocolors';
import { StateMachine } from '../../core/state-machine.js';
import { PhaseOrder } from '../../core/state-schema.js';

export function runStatus(): void {
  const baseDir = process.cwd();
  const sm = new StateMachine(baseDir);
  const state = sm.getState();

  if (!state) {
    console.log(pc.yellow('\nℹ️  No active Axon feature tracked. Start one with: ') + pc.cyan('axon new <feature-name>\n'));
    return;
  }

  console.log(pc.bold(pc.cyan(`\n📊 Axon Engineering Harness Status`)));
  console.log(pc.gray('─'.repeat(50)));
  console.log(pc.bold('Feature:    ') + pc.yellow(state.feature));
  console.log(pc.bold('Status:     ') + (state.status === 'completed' ? pc.green('Completed') : pc.cyan(state.status)));
  console.log(pc.bold('Updated:    ') + pc.gray(new Date(state.updatedAt).toLocaleString()));

  // Visual Pipeline Progress Bar
  console.log(pc.bold('\nLifecycle Pipeline:'));
  const pipeline = PhaseOrder.map(phase => {
    if (phase === state.phase) {
      return pc.bold(pc.bgCyan(pc.black(` [${phase.toUpperCase()}] `)));
    }
    const isPast = PhaseOrder.indexOf(phase) < PhaseOrder.indexOf(state.phase);
    if (isPast) {
      return pc.green(`✓ ${phase}`);
    }
    return pc.gray(`○ ${phase}`);
  }).join(pc.gray(' ➔ '));

  console.log(`  ${pipeline}\n`);

  // Active files
  console.log(pc.bold('Tracked Files:'));
  console.log(pc.gray('  Spec (SDD): ') + (state.activeSpec ? pc.cyan(state.activeSpec) : pc.gray('none')));
  console.log(pc.gray('  BDD:        ') + (state.activeBdd ? pc.cyan(state.activeBdd) : pc.gray('none')));
  console.log(pc.gray('  Test:       ') + (state.activeTest ? pc.cyan(state.activeTest) : pc.gray('none')));
  console.log(pc.gray('  Target:     ') + (state.targetFile ? pc.cyan(state.targetFile) : pc.gray('none')));

  // History count
  if (state.history && state.history.length > 0) {
    console.log(pc.bold('\nRecent Transitions:'));
    state.history.slice(-3).forEach(h => {
      console.log(pc.gray(`  • [${h.from} ➔ ${h.to}] ${h.reason || ''}`));
    });
  }

  console.log(pc.gray('─'.repeat(50)) + '\n');
}
