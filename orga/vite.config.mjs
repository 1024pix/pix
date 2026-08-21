import { fileURLToPath } from 'node:url';

import { loadTranslations } from '@ember-intl/vite';
import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import sassEmbedded from 'sass-embedded';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@1024pix\/ember-testing-library$/,
        replacement: fileURLToPath(import.meta.resolve('@1024pix/ember-testing-library/addon/index.js')),
      },
    ],
  },
  build: {
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        implementation: sassEmbedded,
        loadPaths: ['app/styles', 'node_modules/@1024pix/nebulix-ember/dist/styles'],
      },
    },
  },
  esbuild: {
    sourcemap: true,
    sourcesContent: true,
  },
  optimizeDeps: {
    exclude: ['ember-exam'],
  },
  test: {
    sourcemap: true,
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    loadTranslations(),
  ],
  preview: {
    port: 4201,
    host: true,
    allowedHosts: ['orga.dev.pix.fr', 'orga.dev.pix.org'],
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PIX_API_PORT ? process.env.PIX_API_PORT : 3000}`,
        xfwd: true,
      },
    },
  },
  server: {
    port: 4201,
    host: true,
    allowedHosts: ['orga.dev.pix.fr', 'orga.dev.pix.org'],
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PIX_API_PORT ? process.env.PIX_API_PORT : 3000}`,
        xfwd: true,
      },
    },
  },
});
