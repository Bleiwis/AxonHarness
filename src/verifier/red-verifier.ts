import fs from 'node:fs';
import path from 'node:path';
import { AxonState } from '../core/state-schema.js';
import { TestRunnerAdapter, TestExecutionResult } from './test-runner-adapter.js';

export interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string;
  execution?: TestExecutionResult;
}

export class RedVerifier {
  private baseDir: string;
  private adapter: TestRunnerAdapter;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
    this.adapter = new TestRunnerAdapter(this.baseDir);
  }

  public verify(state: AxonState): VerificationResult {
    if (!state.activeTest) {
      return {
        passed: false,
        message: `No activeTest defined in state for feature '${state.feature}'.`
      };
    }

    const testFilePath = path.join(this.baseDir, state.activeTest);
    if (!fs.existsSync(testFilePath)) {
      return {
        passed: false,
        message: `Active test file does not exist: ${state.activeTest}`,
        details: 'You must create the failing test file before verifying Red state.'
      };
    }

    const testContent = fs.readFileSync(testFilePath, 'utf8').trim();
    if (testContent.length === 0) {
      return {
        passed: false,
        message: `Active test file is empty: ${state.activeTest}`,
        details: 'The test file must contain a test suite implementation.'
      };
    }

    const execution = this.adapter.runTest(undefined, state.activeTest);

    // In RED phase, the test MUST FAIL (exit code != 0)
    if (execution.exitCode !== 0) {
      return {
        passed: true,
        message: `🔴 [PASS] Test correctly failed as expected in TDD Red phase.`,
        details: `Command: ${execution.command}\nExecution time: ${execution.durationMs}ms`,
        execution
      };
    } else {
      return {
        passed: false,
        message: `❌ [FAIL] Test passed in Red phase! In TDD Red, the test MUST fail before writing code.`,
        details: `Output:\n${execution.stdout}`,
        execution
      };
    }
  }
}
