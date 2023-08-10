import { defineConfig } from 'tsup'

export default defineConfig((opts) => ({
  entry: [
    'src/index.ts',
  ],
  clean: !opts.watch,
  dts: true,
  format: ['cjs', 'esm'],
  ignoreWatch: ['**/.turbo', '**/dist', '**/node_modules', '**/.git'],
}))
