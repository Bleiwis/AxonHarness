import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { StateMachine } from '../../core/state-machine.js';

export function runInit(options: { isolated?: boolean; root?: boolean }): void {
  const baseDir = process.cwd();
  const sm = new StateMachine(baseDir);
  const isIsolated = options.isolated ?? !options.root;

  console.log(pc.bold(pc.cyan('\n🛡️  Initializing Axon Engineering Harness...\n')));

  const config = sm.saveConfig({
    isolated: isIsolated,
    specsDir: isIsolated ? 'axon_harness/specs/features' : 'specs/features',
    bddDir: isIsolated ? 'axon_harness/specs/bdd' : 'specs/bdd',
    srcDir: 'src',
    testsDir: 'tests'
  });

  // Ensure necessary folders exist
  const dirs = [
    config.specsDir,
    config.bddDir,
    config.srcDir,
    config.testsDir,
    '.axon'
  ];

  dirs.forEach(d => {
    const fullPath = path.join(baseDir, d);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(pc.green(`  ✓ Created directory: ${d}`));
    }
  });

  console.log(pc.green(`  ✓ Config saved at .axon/config.json (isolated: ${isIsolated})`));
  console.log(pc.bold(pc.green('\n🎉 Axon Harness initialized successfully!')));
  console.log(pc.gray('   Start your first feature with: ') + pc.cyan('axon new <feature-name>\n'));
}
