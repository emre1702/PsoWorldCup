/// <reference types="vitest" />

import { defineConfig, splitVendorChunkPlugin } from 'vite';
import analog from '@analogjs/platform';
import * as path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  publicDir: 'src/assets',
  server: {
    host: '127.0.0.1',
  },
  optimizeDeps: {
    include: ['@angular/common', '@angular/forms', 'isomorphic-fetch'],
  },
  ssr: {
    noExternal: [
      '@analogjs/trpc/**',
      '@angular/cdk/**',
      '@ng-icons/**',
      'ngx-scrollbar/**',
    ],
  },
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
    alias: {
      '~': path.resolve(__dirname, './src'),
      'src/': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    analog({
      vite: {
        inlineStylesExtension: 'scss',
        tsconfig: path.resolve(__dirname, './tsconfig.app.json'),
      },
      nitro: {
        preset: 'vercel',
        serveStatic: false,
      },
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
      dir: `../../node_modules/.vitest`,
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
