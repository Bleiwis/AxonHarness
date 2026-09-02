import { z } from 'zod';

export const FeaturePhaseSchema = z.enum([
  'sdd',        // Writing / validating formal spec
  'bdd',        // Defining Gherkin scenarios & acceptance criteria
  'tdd_red',    // Writing failing test (must fail cleanly)
  'tdd_green',  // Implementing minimal code to pass test
  'refactor',   // Code cleanup / domain alignment
  'verified'    // Full invariant verification passed
]);

export type FeaturePhase = z.infer<typeof FeaturePhaseSchema>;

export const PhaseOrder: FeaturePhase[] = [
  'sdd',
  'bdd',
  'tdd_red',
  'tdd_green',
  'refactor',
  'verified'
];

export const AxonStateSchema = z.object({
  version: z.string().default('1.0.0'),
  feature: z.string(),
  phase: FeaturePhaseSchema,
  activeSpec: z.string().optional(),
  activeBdd: z.string().optional(),
  activeTest: z.string().optional(),
  targetFile: z.string().optional(),
  status: z.enum(['in_progress', 'awaiting_human_validation', 'blocked', 'completed']).default('in_progress'),
  tokenBudget: z.object({
    maxTokensPerPrompt: z.number().default(4000),
    estimatedTokens: z.number().default(0),
    tokensSaved: z.number().default(0)
  }).default({
    maxTokensPerPrompt: 4000,
    estimatedTokens: 0,
    tokensSaved: 0
  }),
  history: z.array(z.object({
    from: FeaturePhaseSchema,
    to: FeaturePhaseSchema,
    timestamp: z.string(),
    reason: z.string().optional()
  })).default([]),
  updatedAt: z.string()
});

export type AxonState = z.infer<typeof AxonStateSchema>;

export const AxonConfigSchema = z.object({
  isolated: z.boolean().default(true),
  rootDir: z.string().default('.'),
  specsDir: z.string().default('specs/features'),
  bddDir: z.string().default('specs/bdd'),
  srcDir: z.string().default('src'),
  testsDir: z.string().default('tests'),
  testCommand: z.string().optional(),
  tokenBudgetLimit: z.number().default(4000)
});

export type AxonConfig = z.infer<typeof AxonConfigSchema>;
