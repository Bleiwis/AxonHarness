import pc from 'picocolors';
import { StateMachine } from '../../core/state-machine.js';
import { PromptCompiler } from '../../compressor/prompt-compiler.js';
import { FeaturePhase, FeaturePhaseSchema } from '../../core/state-schema.js';

export function runContext(options: { step?: string; budget?: boolean }): void {
  const baseDir = process.cwd();
  const sm = new StateMachine(baseDir);
  const state = sm.getState();

  if (!state) {
    console.error(pc.red('Error: No active feature found. Run `axon new <feature>` first.'));
    process.exit(1);
  }

  let targetPhase: FeaturePhase | undefined;
  if (options.step) {
    const parsed = FeaturePhaseSchema.safeParse(options.step);
    if (!parsed.success) {
      console.error(pc.red(`Error: Invalid step '${options.step}'. Valid steps: sdd, bdd, tdd_red, tdd_green, refactor, verified.`));
      process.exit(1);
    }
    targetPhase = parsed.data;
  }

  const compiler = new PromptCompiler(baseDir);
  const compiled = compiler.compile(state, targetPhase);

  // Print token report header to stderr so stdout is pure prompt if redirected
  console.error(pc.bold(pc.cyan(`\n📦 Axon Context Compressor (Phase: ${pc.yellow(compiled.phase.toUpperCase())} | Feature: ${pc.yellow(compiled.feature)})`)));
  console.error(pc.gray(`   Files included: ${compiled.filesIncluded.join(', ') || 'None'}`));
  console.error(pc.gray(`   Estimated Prompt Tokens: `) + pc.bold(pc.green(`${compiled.report.compressedTokens} tokens`)));
  if (compiled.report.tokensSaved > 0) {
    console.error(pc.gray(`   Tokens Saved vs Raw Files: `) + pc.bold(pc.green(`~${compiled.report.tokensSaved} tokens (-${compiled.report.savingsPercentage}%)`)));
  }
  console.error(pc.gray('─'.repeat(60)) + '\n');

  // Output prompt to stdout
  console.log(compiled.prompt);
}
