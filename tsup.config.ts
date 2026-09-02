import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli/index.ts',
    mcp: 'src/mcp/server.ts',
    index: 'src/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  shims: true
});
