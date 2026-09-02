import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface TestExecutionResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export class TestRunnerAdapter {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
  }

  public detectTestCommand(specificTestPath?: string): string {
    const pkgPath = path.join(this.baseDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const testScript = pkg.scripts?.test;
        if (testScript && testScript.includes('vitest')) {
          return specificTestPath ? `npx vitest run ${specificTestPath}` : `npm test`;
        }
        if (testScript && testScript.includes('jest')) {
          return specificTestPath ? `npx jest ${specificTestPath}` : `npm test`;
        }
        if (testScript) {
          return specificTestPath ? `npm test -- ${specificTestPath}` : `npm test`;
        }
      } catch {
        // Fallback to default
      }
    }

    if (fs.existsSync(path.join(this.baseDir, 'pytest.ini')) || fs.existsSync(path.join(this.baseDir, 'pyproject.toml'))) {
      return specificTestPath ? `pytest ${specificTestPath}` : `pytest`;
    }

    if (fs.existsSync(path.join(this.baseDir, 'Cargo.toml'))) {
      return specificTestPath ? `cargo test ${specificTestPath}` : `cargo test`;
    }

    if (fs.existsSync(path.join(this.baseDir, 'go.mod'))) {
      return specificTestPath ? `go test ./...` : `go test ./...`;
    }

    return specificTestPath ? `npm test -- ${specificTestPath}` : `npm test`;
  }

  public runTest(customCommand?: string, specificTestPath?: string): TestExecutionResult {
    const commandToRun = customCommand || this.detectTestCommand(specificTestPath);
    const start = Date.now();

    const result = spawnSync(commandToRun, {
      cwd: this.baseDir,
      shell: true,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true', FORCE_COLOR: '0' }
    });

    const durationMs = Date.now() - start;

    return {
      command: commandToRun,
      exitCode: result.status ?? 1,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      durationMs
    };
  }
}
