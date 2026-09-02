import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runNew } from './commands/new.js';
import { runContext } from './commands/context.js';
import { runVerify } from './commands/verify.js';
import { runNext } from './commands/next.js';
import { runStatus } from './commands/status.js';

export function createCli(): Command {
  const program = new Command();

  program
    .name('axon')
    .description('AI-Native Engineering Harness: State machine, Anti-UBB context compressor & SDD/BDD/TDD orchestrator')
    .version('1.1.0');

  program
    .command('init')
    .description('Initialize Axon Harness configuration and project state')
    .option('--isolated', 'Use isolated axon_harness/ directory', true)
    .option('--root', 'Use root directory layout')
    .action(runInit);

  program
    .command('new <feature>')
    .description('Start a new feature guided by the Axon state machine')
    .option('--spec <path>', 'Custom spec path')
    .option('--bdd <path>', 'Custom BDD path')
    .option('--test <path>', 'Custom test path')
    .option('--target <path>', 'Custom target implementation path')
    .action(runNew);

  program
    .command('context')
    .description('Generate minimal token-compressed context prompt for AI models')
    .option('-s, --step <phase>', 'Override target phase context (sdd, bdd, tdd_red, tdd_green, refactor)')
    .option('-b, --budget', 'Display detailed token budget report')
    .action(runContext);

  program
    .command('verify')
    .description('Run deterministic validation gates for the current active phase')
    .action(runVerify);

  program
    .command('next')
    .description('Verify current phase requirements and advance to the next lifecycle phase')
    .option('-f, --force', 'Force advancement without verification checks')
    .option('-r, --reason <reason>', 'Optional reason or commit message for transition')
    .action(runNext);

  program
    .command('status')
    .description('Display visual dashboard of current feature, active phase, and tracked files')
    .action(runStatus);

  return program;
}

export function runMain(): void {
  const program = createCli();
  program.parse(process.argv);
}
