import fs from 'node:fs';
import path from 'node:path';
import { AxonState } from '../core/state-schema.js';
import { VerificationResult } from './red-verifier.js';

export class SpecVerifier {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
  }

  public verifySdd(state: AxonState): VerificationResult {
    if (!state.activeSpec) {
      return {
        passed: false,
        message: `No activeSpec defined in state for feature '${state.feature}'.`
      };
    }

    const specPath = path.join(this.baseDir, state.activeSpec);
    if (!fs.existsSync(specPath)) {
      return {
        passed: false,
        message: `Spec file does not exist at: ${state.activeSpec}`
      };
    }

    const content = fs.readFileSync(specPath, 'utf8');
    if (content.length < 50) {
      return {
        passed: false,
        message: `Spec file is too short or empty (${content.length} bytes). Must define requirements.`
      };
    }

    return {
      passed: true,
      message: `📋 [PASS] Specification '${state.activeSpec}' is valid and ready.`
    };
  }

  public verifyBdd(state: AxonState): VerificationResult {
    if (!state.activeBdd) {
      return {
        passed: false,
        message: `No activeBdd defined in state for feature '${state.feature}'.`
      };
    }

    const bddPath = path.join(this.baseDir, state.activeBdd);
    if (!fs.existsSync(bddPath)) {
      return {
        passed: false,
        message: `BDD feature file does not exist at: ${state.activeBdd}`
      };
    }

    const content = fs.readFileSync(bddPath, 'utf8');
    if (!content.includes('Feature:') && !content.includes('Scenario:')) {
      return {
        passed: false,
        message: `BDD file does not contain valid Gherkin syntax (missing 'Feature:' or 'Scenario:').`
      };
    }

    return {
      passed: true,
      message: `🧪 [PASS] BDD Feature '${state.activeBdd}' contains valid Gherkin scenarios.`
    };
  }
}
