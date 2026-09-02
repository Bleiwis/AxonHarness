import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { StateMachine } from '../../core/state-machine.js';

export function runNew(featureName: string, options: { spec?: string; bdd?: string; test?: string; target?: string }): void {
  if (!featureName || featureName.trim().length === 0) {
    console.error(pc.red('Error: Feature name is required. Example: axon new user-auth'));
    process.exit(1);
  }

  const baseDir = process.cwd();
  const sm = new StateMachine(baseDir);
  const config = sm.getConfig();

  const state = sm.startFeature(featureName, {
    activeSpec: options.spec,
    activeBdd: options.bdd,
    activeTest: options.test,
    targetFile: options.target
  });

  console.log(pc.bold(pc.cyan(`\n✨ Initialized new feature: ${pc.yellow(state.feature)}`)));
  console.log(pc.gray('   Current Phase: ') + pc.bold(pc.magenta(state.phase.toUpperCase())));

  // Create spec template file if activeSpec doesn't exist
  if (state.activeSpec) {
    const specPath = path.join(baseDir, state.activeSpec);
    if (!fs.existsSync(specPath)) {
      const parentDir = path.dirname(specPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      const initialSpec = `# Feature Specification: ${state.feature}

## 1. Problem Statement
Describe the core problem this feature solves.

## 2. User Stories & Acceptance Criteria
- **US-01**: As a user, I want to ..., so that ...
  - Criteria 1: ...
  - Criteria 2: ...

## 3. Scope
- **In Scope**:
  - ...
- **Out of Scope**:
  - ...

## 4. Data Contracts & Interfaces
\`\`\`typescript
export interface ${state.feature.replace(/(?:^|-)([a-z])/g, (_, c) => c.toUpperCase())}Payload {
  // Define fields here
}
\`\`\`
`;
      fs.writeFileSync(specPath, initialSpec, 'utf8');
      console.log(pc.green(`  ✓ Created initial spec: ${state.activeSpec}`));
    }
  }

  console.log(pc.bold(pc.green('\n🚀 Next Steps:')));
  console.log(pc.gray('   1. Edit specification: ') + pc.cyan(state.activeSpec || 'specs/...'));
  console.log(pc.gray('   2. Get AI context prompt: ') + pc.cyan('axon context'));
  console.log(pc.gray('   3. Advance to BDD phase: ') + pc.cyan('axon next\n'));
}
