#!/usr/bin/env node

/**
 * AxonHarness CLI Installer
 * Installs the AI-Native Engineering Harness protocol into any project.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIR = process.cwd();

// Parse arguments
const args = process.argv.slice(2);
const command = args[0] || 'init';
const isIsolated = args.includes('--isolated') || (!args.includes('--root')); // default to isolated for maximum safety

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function updateAgentsMdForIsolated(agentsMdPath) {
  if (!fs.existsSync(agentsMdPath)) return;
  let content = fs.readFileSync(agentsMdPath, 'utf8');

  // Replace default paths with axon_harness/ paths
  content = content.replace(/docs\/constitution\.md/g, 'axon_harness/constitution.md');
  content = content.replace(/specs\/features\//g, 'axon_harness/specs/features/');
  content = content.replace(/specs\/templates\/spec\.template\.md/g, 'axon_harness/specs/templates/spec.template.md');
  content = content.replace(/docs\/architecture\//g, 'axon_harness/docs/architecture/');
  content = content.replace(/docs\/adr\//g, 'axon_harness/docs/adr/');
  content = content.replace(/specs\/bdd\//g, 'axon_harness/specs/bdd/');
  content = content.replace(/specs\/templates\/bdd\.template\.feature/g, 'axon_harness/specs/templates/bdd.template.feature');

  fs.writeFileSync(agentsMdPath, content, 'utf8');
}

function createBridgeFiles(targetDir, isolated) {
  const specsPath = isolated ? 'axon_harness/specs/features/' : 'specs/features/';
  const bddPath = isolated ? 'axon_harness/specs/bdd/' : 'specs/bdd/';
  const constPath = isolated ? 'axon_harness/constitution.md' : 'docs/constitution.md';

  const harnessHeader = `<!-- AxonHarness Integration -->
## 🛡️ Axon AI Engineering Harness Protocol
This repository adheres to the **Axon Engineering Harness**:
- **Master Protocol**: [.agents/AGENTS.md](.agents/AGENTS.md)
- **Constitution**: [${constPath}](${constPath})
- **Specifications (SDD)**: \`${specsPath}\`
- **Behavior Specs (BDD)**: \`${bddPath}\`
- **Architecture & Invariants**: \`.agents/rules/\`
- **OWASP Security Skills**: \`.agents/skills/owasp-*\`

### Operating Rule for Agents:
1. **SDD**: Always check or define formal requirements in \`${specsPath}\` before building.
2. **BDD**: Write declarative \`.feature\` behavior specs in \`${bddPath}\`.
3. **TDD**: Write failing tests first (**Red**), pass with minimal code (**Green**), then **Refactor**.
4. **OWASP Top 10:2025**: Consult \`.agents/skills/owasp-*\` for any security, auth, input, or session changes.
`;

  // 1. Root AGENTS.md / agent.md check & prepend
  const rootAgentsPath = path.join(targetDir, 'AGENTS.md');
  const rootAgentLower = path.join(targetDir, 'agent.md');
  const targetRootAgent = fs.existsSync(rootAgentsPath) ? rootAgentsPath : (fs.existsSync(rootAgentLower) ? rootAgentLower : rootAgentsPath);

  if (fs.existsSync(targetRootAgent)) {
    let existing = fs.readFileSync(targetRootAgent, 'utf8');
    if (!existing.includes('Axon Engineering Harness') && !existing.includes('AxonHarness')) {
      fs.writeFileSync(targetRootAgent, `${harnessHeader}\n---\n\n${existing}`, 'utf8');
      console.log(`  ✓ Linked AxonHarness into existing root ${path.basename(targetRootAgent)}`);
    }
  } else {
    fs.writeFileSync(rootAgentsPath, harnessHeader, 'utf8');
    console.log(`  ✓ Created root AGENTS.md bridge`);
  }

  // 2. Cursor (.cursorrules & .cursor/rules/axon.mdc)
  const cursorRulesPath = path.join(targetDir, '.cursorrules');
  if (!fs.existsSync(cursorRulesPath)) {
    fs.writeFileSync(cursorRulesPath, `${harnessHeader}\n`, 'utf8');
    console.log(`  ✓ Created .cursorrules for Cursor AI`);
  }

  const cursorRulesDir = path.join(targetDir, '.cursor', 'rules');
  if (!fs.existsSync(cursorRulesDir)) {
    fs.mkdirSync(cursorRulesDir, { recursive: true });
  }
  const cursorMdcPath = path.join(cursorRulesDir, 'axon.mdc');
  if (!fs.existsSync(cursorMdcPath)) {
    fs.writeFileSync(cursorMdcPath, `---\ndescription: Axon AI Engineering Protocol, SDD, BDD, TDD and OWASP Rules\nglobs: *\n---\n\n${harnessHeader}\n`, 'utf8');
    console.log(`  ✓ Created .cursor/rules/axon.mdc`);
  }

  // 3. Claude Code (CLAUDE.md)
  const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
  if (fs.existsSync(claudeMdPath)) {
    let existing = fs.readFileSync(claudeMdPath, 'utf8');
    if (!existing.includes('AxonHarness') && !existing.includes('Axon Engineering Harness')) {
      fs.writeFileSync(claudeMdPath, `${harnessHeader}\n---\n\n${existing}`, 'utf8');
      console.log(`  ✓ Linked AxonHarness into existing CLAUDE.md`);
    }
  } else {
    fs.writeFileSync(claudeMdPath, `# CLAUDE Guidelines\n\n${harnessHeader}`, 'utf8');
    console.log(`  ✓ Created CLAUDE.md for Claude Code CLI`);
  }

  // 4. Windsurf (.windsurfrules)
  const windsurfPath = path.join(targetDir, '.windsurfrules');
  if (!fs.existsSync(windsurfPath)) {
    fs.writeFileSync(windsurfPath, `${harnessHeader}\n`, 'utf8');
    console.log(`  ✓ Created .windsurfrules for Windsurf IDE`);
  }

  // 5. GitHub Copilot (.github/copilot-instructions.md)
  const githubDir = path.join(targetDir, '.github');
  if (!fs.existsSync(githubDir)) {
    fs.mkdirSync(githubDir, { recursive: true });
  }
  const copilotPath = path.join(githubDir, 'copilot-instructions.md');
  if (!fs.existsSync(copilotPath)) {
    fs.writeFileSync(copilotPath, `${harnessHeader}\n`, 'utf8');
    console.log(`  ✓ Created .github/copilot-instructions.md for GitHub Copilot`);
  }
}


function runInit() {
  console.log('\n🚀 Initializing AxonHarness AI Engineering Harness...');
  console.log(`📁 Target Directory: ${TARGET_DIR}`);
  console.log(`⚙️  Installation Mode: ${isIsolated ? 'Isolated (axon_harness/)' : 'Root-level'}\n`);

  // 1. Copy .agents/ directly into project root (CRITICAL for Antigravity / IDE agent auto-detection)
  const sourceAgents = path.join(ROOT_DIR, '.agents');
  const targetAgents = path.join(TARGET_DIR, '.agents');

  console.log('📦 Installing AI Agent Guardrails & Skills (.agents/)...');
  copyRecursiveSync(sourceAgents, targetAgents);

  if (isIsolated) {
    // 2. Install into axon_harness/ directory
    const targetHarness = path.join(TARGET_DIR, 'axon_harness');
    if (!fs.existsSync(targetHarness)) {
      fs.mkdirSync(targetHarness, { recursive: true });
    }

    console.log('📦 Installing Isolated Harness Artifacts (axon_harness/)...');
    
    // Copy docs
    if (fs.existsSync(path.join(ROOT_DIR, 'docs'))) {
      copyRecursiveSync(path.join(ROOT_DIR, 'docs'), path.join(targetHarness, 'docs'));
      if (fs.existsSync(path.join(ROOT_DIR, 'docs', 'constitution.md'))) {
        fs.copyFileSync(
          path.join(ROOT_DIR, 'docs', 'constitution.md'),
          path.join(targetHarness, 'constitution.md')
        );
      }
    }

    // Copy specs
    if (fs.existsSync(path.join(ROOT_DIR, 'specs'))) {
      copyRecursiveSync(path.join(ROOT_DIR, 'specs'), path.join(targetHarness, 'specs'));
    }

    // Copy verify scripts if present
    if (fs.existsSync(path.join(ROOT_DIR, '.harness'))) {
      copyRecursiveSync(path.join(ROOT_DIR, '.harness'), path.join(targetHarness, 'verify'));
    }

    // Update .agents/AGENTS.md to point to axon_harness/
    updateAgentsMdForIsolated(path.join(targetAgents, 'AGENTS.md'));

  } else {
    // 2b. Root installation
    console.log('📦 Installing Root Harness Structure (specs/, docs/, .harness/)...');
    if (fs.existsSync(path.join(ROOT_DIR, 'specs'))) {
      copyRecursiveSync(path.join(ROOT_DIR, 'specs'), path.join(TARGET_DIR, 'specs'));
    }
    if (fs.existsSync(path.join(ROOT_DIR, 'docs'))) {
      copyRecursiveSync(path.join(ROOT_DIR, 'docs'), path.join(TARGET_DIR, 'docs'));
    }
    if (fs.existsSync(path.join(ROOT_DIR, '.harness'))) {
      copyRecursiveSync(path.join(ROOT_DIR, '.harness'), path.join(TARGET_DIR, '.harness'));
    }
  }

  // Suggest / check tsconfig.json if in TypeScript / NestJS
  const tsconfigPath = path.join(TARGET_DIR, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath) && isIsolated) {
    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      if (!tsconfigContent.includes('axon_harness')) {
        console.log('💡 Tip: For TypeScript/NestJS projects, ensure "axon_harness" is excluded in tsconfig.json.');
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Create Multi-Agent Bridge Files (Cursor, Claude, Windsurf, Copilot, VS Code)
  console.log('🌉 Setting up Cross-Agent Bridge Files (Cursor, Claude, Windsurf, Copilot)...');
  createBridgeFiles(TARGET_DIR, isIsolated);

  console.log('\n✅ AxonHarness successfully installed!');
  console.log('🤖 All AI Agents (Antigravity, Cursor, Claude, Windsurf, Copilot) are now locked into Axon Protocols.\n');
}

if (command === 'init') {
  runInit();
} else if (command === '--help' || command === '-h' || command === 'help') {
  console.log(`
AxonHarness CLI

Usage:
  npx axon-harness init [options]

Options:
  --isolated    (Default) Installs harness into 'axon_harness/' namespace + '.agents/' in root.
  --root        Installs specs/, docs/, .harness/ directly into root directory.
  --help, -h    Show this help message.
`);
} else {
  console.log(`Unknown command: ${command}`);
  console.log('Usage: npx axon-harness init [--isolated | --root]');
  process.exit(1);
}
