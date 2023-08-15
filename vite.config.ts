/// <reference types="vitest" />

import { defineConfig, splitVendorChunkPlugin } from 'vite';
import analog from '@analogjs/platform';
import { visualizer } from 'rollup-plugin-visualizer';
import tsConfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  publicDir: 'src/assets',
  optimizeDeps: {
    include: ['@angular/common', '@angular/forms', 'isomorphic-fetch'],
  },
  ssr: {
    noExternal: [
      '@analogjs/trpc',
      '@angular/cdk'
    ],
  },
  build: {
    target: ['es2020'],
  },
  plugins: [
    analog({
      vite: {
        inlineStylesExtension: 'scss',
      },
      nitro: {
        preset: 'vercel',
        serveStatic: false,
      },
      prerender: {
        routes: ['/'],
      },
    }),
    tsConfigPaths({
      root: './'
    }),
    visualizer(),
    splitVendorChunkPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    include: ['**/*.spec.ts'],
    cache: {
      dir: `./node_modules/.vitest`,
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
