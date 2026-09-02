import fs from 'node:fs';
import path from 'node:path';
import { AxonState, FeaturePhase } from '../core/state-schema.js';
import { TokenBudgetManager, CompressionReport } from '../core/token-budget.js';
import { ASTExtractor } from './ast-extractor.js';

export interface CompiledContext {
  phase: FeaturePhase;
  feature: string;
  prompt: string;
  report: CompressionReport;
  filesIncluded: string[];
}

export class PromptCompiler {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
  }

  public compile(state: AxonState, targetPhase?: FeaturePhase): CompiledContext {
    const phase = targetPhase || state.phase;
    const filesIncluded: string[] = [];
    let uncompressedContent = '';
    let promptSections: string[] = [];

    // Header with strict instructions
    promptSections.push(`<!-- Axon Context (Phase: ${phase.toUpperCase()} | Feature: ${state.feature}) -->`);
    promptSections.push(`You are operating in the **Axon Engineering Harness** state machine.`);
    promptSections.push(`Current Phase: \`${phase}\` | Feature: \`${state.feature}\``);

    switch (phase) {
      case 'sdd': {
        promptSections.push(`\n## 📋 Objective: Formal Specification (SDD)`);
        promptSections.push(`Write or update the specification file \`${state.activeSpec}\`.`);
        promptSections.push(`Ground all requirements strictly. Define User Stories, In Scope / Out of Scope, and Data Contracts.`);
        
        // Add constitution summary if exists
        const constPath = path.join(this.baseDir, 'docs/constitution.md');
        if (fs.existsSync(constPath)) {
          const content = fs.readFileSync(constPath, 'utf8');
          uncompressedContent += content;
          promptSections.push(`\n### Constitution Invariants\n\`\`\`markdown\n${content}\n\`\`\``);
          filesIncluded.push('docs/constitution.md');
        }
        break;
      }

      case 'bdd': {
        promptSections.push(`\n## 🧪 Objective: Behavior Specification (BDD)`);
        promptSections.push(`Translate the acceptance criteria from \`${state.activeSpec}\` into Gherkin feature scenarios in \`${state.activeBdd}\`.`);
        promptSections.push(`Use declarative business rules: 'Rule:', 'Scenario:', 'Given', 'When', 'Then'. Avoid technical UI verbs.`);

        if (state.activeSpec) {
          const specPath = path.join(this.baseDir, state.activeSpec);
          if (fs.existsSync(specPath)) {
            const specContent = fs.readFileSync(specPath, 'utf8');
            uncompressedContent += specContent;
            promptSections.push(`\n### Active Specification (${state.activeSpec})\n\`\`\`markdown\n${specContent}\n\`\`\``);
            filesIncluded.push(state.activeSpec);
          }
        }
        break;
      }

      case 'tdd_red': {
        promptSections.push(`\n## 🔴 Objective: Write Failing Test (TDD Red)`);
        promptSections.push(`Create or update unit/integration tests in \`${state.activeTest}\` implementing the BDD scenario.`);
        promptSections.push(`⚠️ IMPORTANT: The test MUST fail for the right business logic reason when executed.`);

        if (state.activeBdd) {
          const bddPath = path.join(this.baseDir, state.activeBdd);
          if (fs.existsSync(bddPath)) {
            const bddContent = fs.readFileSync(bddPath, 'utf8');
            uncompressedContent += bddContent;
            promptSections.push(`\n### Companion BDD Feature (${state.activeBdd})\n\`\`\`gherkin\n${bddContent}\n\`\`\``);
            filesIncluded.push(state.activeBdd);
          }
        }

        if (state.targetFile) {
          const targetPath = path.join(this.baseDir, state.targetFile);
          if (fs.existsSync(targetPath)) {
            const rawContent = fs.readFileSync(targetPath, 'utf8');
            uncompressedContent += rawContent;
            const extraction = ASTExtractor.extractFromString(rawContent, path.basename(targetPath));
            promptSections.push(`\n### Type Skeleton / Contracts (${state.targetFile})\n\`\`\`typescript\n${extraction.typeSkeleton}\n\`\`\``);
            filesIncluded.push(`${state.targetFile} (Type Skeleton AST)`);
          }
        }
        break;
      }

      case 'tdd_green': {
        promptSections.push(`\n## 🟢 Objective: Implement Minimal Code to Pass (TDD Green)`);
        promptSections.push(`Write the minimal clean code in \`${state.targetFile}\` to make the failing test in \`${state.activeTest}\` pass.`);
        promptSections.push(`Do NOT over-engineer or add out-of-scope features.`);

        if (state.activeTest) {
          const testPath = path.join(this.baseDir, state.activeTest);
          if (fs.existsSync(testPath)) {
            const testContent = fs.readFileSync(testPath, 'utf8');
            uncompressedContent += testContent;
            promptSections.push(`\n### Failing Test to Pass (${state.activeTest})\n\`\`\`typescript\n${testContent}\n\`\`\``);
            filesIncluded.push(state.activeTest);
          }
        }

        if (state.targetFile) {
          const targetPath = path.join(this.baseDir, state.targetFile);
          if (fs.existsSync(targetPath)) {
            const rawContent = fs.readFileSync(targetPath, 'utf8');
            uncompressedContent += rawContent;
            const extraction = ASTExtractor.extractFromString(rawContent, path.basename(targetPath));
            promptSections.push(`\n### Target File Skeleton (${state.targetFile})\n\`\`\`typescript\n${extraction.typeSkeleton}\n\`\`\``);
            filesIncluded.push(`${state.targetFile} (Type Skeleton AST)`);
          }
        }
        break;
      }

      case 'refactor': {
        promptSections.push(`\n## 🧹 Objective: Refactor & Invariant Cleanup`);
        promptSections.push(`Clean up code in \`${state.targetFile}\`, remove duplication, and verify architecture boundaries.`);
        promptSections.push(`All tests must remain 100% green.`);
        break;
      }

      case 'verified': {
        promptSections.push(`\n## 🛡️ Objective: Full Harness Verification`);
        promptSections.push(`Run full project verification: linting, tests, invariant and security checks.`);
        break;
      }
    }

    const finalPrompt = promptSections.join('\n\n');
    const report = TokenBudgetManager.computeSavings(
      uncompressedContent.length > finalPrompt.length ? uncompressedContent : finalPrompt,
      finalPrompt
    );

    return {
      phase,
      feature: state.feature,
      prompt: finalPrompt,
      report,
      filesIncluded
    };
  }
}
