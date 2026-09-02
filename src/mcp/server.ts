import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { StateMachine } from '../core/state-machine.js';
import { PromptCompiler } from '../compressor/prompt-compiler.js';
import { FeaturePhase, FeaturePhaseSchema } from '../core/state-schema.js';
import { executePhaseVerification } from '../cli/commands/verify.js';

export function createMcpServer(baseDir: string = process.cwd()): Server {
  const server = new Server(
    {
      name: 'axon-harness-mcp',
      version: '1.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const sm = new StateMachine(baseDir);
  const promptCompiler = new PromptCompiler(baseDir);

  const TOOLS: Tool[] = [
    {
      name: 'axon_get_status',
      description: 'Get the current active feature, state machine phase, tracked files, and token budget.',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'axon_get_context',
      description: 'Get minimal token-compressed context prompt (Anti-UBB) for the current or specified phase.',
      inputSchema: {
        type: 'object',
        properties: {
          step: {
            type: 'string',
            description: 'Optional phase override (sdd, bdd, tdd_red, tdd_green, refactor, verified)',
            enum: ['sdd', 'bdd', 'tdd_red', 'tdd_green', 'refactor', 'verified']
          }
        }
      }
    },
    {
      name: 'axon_new_feature',
      description: 'Initialize a new feature in the Axon state machine.',
      inputSchema: {
        type: 'object',
        properties: {
          featureName: {
            type: 'string',
            description: 'Name of the feature (e.g. user-auth-jwt)'
          },
          targetFile: {
            type: 'string',
            description: 'Optional target implementation file path'
          }
        },
        required: ['featureName']
      }
    },
    {
      name: 'axon_verify',
      description: 'Run deterministic validation checks for the active phase (Red failing test, Green passing test, Spec checks).',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'axon_advance_phase',
      description: 'Validate requirements and advance to the next lifecycle phase in the state machine.',
      inputSchema: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Optional reason or note for advancing'
          },
          force: {
            type: 'boolean',
            description: 'Bypass verification gates if true'
          }
        }
      }
    }
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'axon_get_status') {
        const state = sm.getState();
        if (!state) {
          return {
            content: [{ type: 'text', text: 'No active Axon state found. Initialize with axon_new_feature.' }]
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(state, null, 2) }]
        };
      }

      if (name === 'axon_get_context') {
        const state = sm.getState();
        if (!state) {
          return {
            content: [{ type: 'text', text: 'No active Axon state found. Start a feature first.' }]
          };
        }
        const step = (args?.step as FeaturePhase) || undefined;
        const compiled = promptCompiler.compile(state, step);
        return {
          content: [
            {
              type: 'text',
              text: `Estimated Tokens: ${compiled.report.compressedTokens} (Saved: ${compiled.report.tokensSaved} tokens / -${compiled.report.savingsPercentage}%)\n\n${compiled.prompt}`
            }
          ]
        };
      }

      if (name === 'axon_new_feature') {
        const featureName = (args?.featureName as string) || 'feature';
        const targetFile = (args?.targetFile as string) || undefined;
        const state = sm.startFeature(featureName, { targetFile });
        return {
          content: [
            {
              type: 'text',
              text: `Feature '${state.feature}' initialized in SDD phase.\nState saved: ${JSON.stringify(state, null, 2)}`
            }
          ]
        };
      }

      if (name === 'axon_verify') {
        const { result, phase } = executePhaseVerification(baseDir);
        return {
          content: [
            {
              type: 'text',
              text: `Verification result for phase [${phase.toUpperCase()}]:\nPassed: ${result.passed}\nMessage: ${result.message}\n${result.details || ''}`
            }
          ]
        };
      }

      if (name === 'axon_advance_phase') {
        const force = Boolean(args?.force);
        const reason = (args?.reason as string) || undefined;

        if (!force) {
          const { result } = executePhaseVerification(baseDir);
          if (!result.passed) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Cannot advance phase: ${result.message}\n${result.details || ''}`
                }
              ]
            };
          }
        }

        const advanceResult = sm.advancePhase(reason);
        if (!advanceResult.success) {
          return {
            content: [{ type: 'text', text: `Failed to advance: ${advanceResult.error}` }]
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Successfully advanced to phase: ${advanceResult.state?.phase}\nState: ${JSON.stringify(advanceResult.state, null, 2)}`
            }
          ]
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Error executing tool ${name}: ${error.message || String(error)}` }]
      };
    }
  });

  return server;
}

export async function runMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// If executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  runMcpServer().catch((err) => {
    console.error('Fatal MCP server error:', err);
    process.exit(1);
  });
}
