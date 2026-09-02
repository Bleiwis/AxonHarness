import fs from 'node:fs';
import path from 'node:path';
import {
  AxonConfig,
  AxonConfigSchema,
  AxonState,
  AxonStateSchema,
  FeaturePhase,
  PhaseOrder
} from './state-schema.js';

export class StateMachine {
  private baseDir: string;
  private axonDir: string;
  private stateFilePath: string;
  private configFilePath: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
    this.axonDir = path.join(this.baseDir, '.axon');
    this.stateFilePath = path.join(this.axonDir, 'state.json');
    this.configFilePath = path.join(this.axonDir, 'config.json');
  }

  public getAxonDir(): string {
    return this.axonDir;
  }

  public getConfig(): AxonConfig {
    if (!fs.existsSync(this.configFilePath)) {
      return AxonConfigSchema.parse({});
    }
    try {
      const raw = JSON.parse(fs.readFileSync(this.configFilePath, 'utf8'));
      return AxonConfigSchema.parse(raw);
    } catch {
      return AxonConfigSchema.parse({});
    }
  }

  public saveConfig(config: Partial<AxonConfig>): AxonConfig {
    this.ensureAxonDir();
    const current = this.getConfig();
    const updated = AxonConfigSchema.parse({ ...current, ...config });
    fs.writeFileSync(this.configFilePath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  }

  public getState(): AxonState | null {
    if (!fs.existsSync(this.stateFilePath)) {
      return null;
    }
    try {
      const raw = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf8'));
      return AxonStateSchema.parse(raw);
    } catch (err) {
      console.error(`[Axon State] Failed to parse ${this.stateFilePath}:`, err);
      return null;
    }
  }

  public saveState(state: AxonState): AxonState {
    this.ensureAxonDir();
    const validated = AxonStateSchema.parse({
      ...state,
      updatedAt: new Date().toISOString()
    });
    fs.writeFileSync(this.stateFilePath, JSON.stringify(validated, null, 2), 'utf8');
    return validated;
  }

  public startFeature(
    featureName: string,
    options: {
      activeSpec?: string;
      activeBdd?: string;
      activeTest?: string;
      targetFile?: string;
    } = {}
  ): AxonState {
    const config = this.getConfig();
    const cleanName = featureName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    
    const activeSpec = options.activeSpec || path.join(config.specsDir, `${cleanName}.spec.md`);
    const activeBdd = options.activeBdd || path.join(config.bddDir, `${cleanName}.feature`);
    const activeTest = options.activeTest || path.join(config.testsDir, `${cleanName}.test.ts`);
    const targetFile = options.targetFile || path.join(config.srcDir, `${cleanName}.ts`);

    const newState: AxonState = {
      version: '1.0.0',
      feature: cleanName,
      phase: 'sdd',
      activeSpec,
      activeBdd,
      activeTest,
      targetFile,
      status: 'in_progress',
      tokenBudget: {
        maxTokensPerPrompt: config.tokenBudgetLimit,
        estimatedTokens: 0,
        tokensSaved: 0
      },
      history: [
        {
          from: 'sdd',
          to: 'sdd',
          timestamp: new Date().toISOString(),
          reason: `Feature '${cleanName}' initialized in SDD phase`
        }
      ],
      updatedAt: new Date().toISOString()
    };

    return this.saveState(newState);
  }

  public getNextPhase(current: FeaturePhase): FeaturePhase | null {
    const currentIndex = PhaseOrder.indexOf(current);
    if (currentIndex === -1 || currentIndex >= PhaseOrder.length - 1) {
      return null;
    }
    return PhaseOrder[currentIndex + 1];
  }

  public getPreviousPhase(current: FeaturePhase): FeaturePhase | null {
    const currentIndex = PhaseOrder.indexOf(current);
    if (currentIndex <= 0) {
      return null;
    }
    return PhaseOrder[currentIndex - 1];
  }

  public advancePhase(reason?: string): { success: boolean; state?: AxonState; error?: string } {
    const currentState = this.getState();
    if (!currentState) {
      return { success: false, error: 'No active Axon state found. Run `axon new <feature>` first.' };
    }

    const next = this.getNextPhase(currentState.phase);
    if (!next) {
      return { success: false, error: `Feature '${currentState.feature}' is already in final phase '${currentState.phase}'.` };
    }

    const historyEntry = {
      from: currentState.phase,
      to: next,
      timestamp: new Date().toISOString(),
      reason: reason || `Advanced from ${currentState.phase} to ${next}`
    };

    const updatedState: AxonState = {
      ...currentState,
      phase: next,
      status: next === 'verified' ? 'completed' : 'in_progress',
      history: [...currentState.history, historyEntry]
    };

    const saved = this.saveState(updatedState);
    return { success: true, state: saved };
  }

  public rollbackPhase(reason?: string): { success: boolean; state?: AxonState; error?: string } {
    const currentState = this.getState();
    if (!currentState) {
      return { success: false, error: 'No active Axon state found.' };
    }

    const prev = this.getPreviousPhase(currentState.phase);
    if (!prev) {
      return { success: false, error: `Feature '${currentState.feature}' is already at initial phase '${currentState.phase}'.` };
    }

    const historyEntry = {
      from: currentState.phase,
      to: prev,
      timestamp: new Date().toISOString(),
      reason: reason || `Rolled back from ${currentState.phase} to ${prev}`
    };

    const updatedState: AxonState = {
      ...currentState,
      phase: prev,
      status: 'in_progress',
      history: [...currentState.history, historyEntry]
    };

    const saved = this.saveState(updatedState);
    return { success: true, state: saved };
  }

  public updateState(partial: Partial<AxonState>): AxonState {
    const current = this.getState();
    if (!current) {
      throw new Error('Cannot update non-existent state. Run `axon new <feature>` first.');
    }
    return this.saveState({ ...current, ...partial });
  }

  private ensureAxonDir(): void {
    if (!fs.existsSync(this.axonDir)) {
      fs.mkdirSync(this.axonDir, { recursive: true });
    }
  }
}
