import fs from 'node:fs';
import path from 'node:path';
import { AxonState } from '../core/state-schema.js';
import { TestRunnerAdapter, TestExecutionResult } from './test-runner-adapter.js';
import { VerificationResult } from './red-verifier.js';

export class GreenVerifier {
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
        message: `Active test file does not exist: ${state.activeTest}`
      };
    }

    if (state.targetFile) {
      const targetFilePath = path.join(this.baseDir, state.targetFile);
      if (!fs.existsSync(targetFilePath)) {
        return {
          passed: false,
          message: `Target implementation file does not exist: ${state.targetFile}`
        };
      }
    }

    const execution = this.adapter.runTest(undefined, state.activeTest);

    // In GREEN phase, the test MUST PASS (exit code === 0)
    if (execution.exitCode === 0) {
      return {
        passed: true,
        message: `🟢 [PASS] All tests passed cleanly in TDD Green phase.`,
        details: `Command: ${execution.command}\nExecution time: ${execution.durationMs}ms`,
        execution
      };
    } else {
      return {
        passed: false,
        message: `❌ [FAIL] Tests are still failing in TDD Green phase.`,
        details: `Errors:\n${execution.stderr || execution.stdout}`,
        execution
      };
    }
  }
}
