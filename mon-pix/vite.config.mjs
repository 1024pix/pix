import { fileURLToPath } from 'node:url';

import { loadTranslations } from '@ember-intl/vite';
import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import sassEmbedded from 'sass-embedded';
import { defineConfig } from 'vite';

export default defineConfig({
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
  resolve: {
    alias: [
      // @ember/string v4 is no longer an Ember addon, so Embroider cannot provide it as
      // a "virtual peer dependency" to v1 addons (ember-responsive) that import it
      // without declaring it. Resolve it explicitly from the app instead.
      { find: /^@ember\/string$/, replacement: fileURLToPath(import.meta.resolve('@ember/string')) },
    ],
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
    port: 4200,
    host: true,
    allowedHosts: ['app.dev.pix.fr', 'app.dev.pix.org'],
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PIX_API_PORT ? process.env.PIX_API_PORT : 3000}`,
        xfwd: true,
      },
    },
  },
  server: {
    port: 4200,
    host: true,
    allowedHosts: ['app.dev.pix.fr', 'app.dev.pix.org'],
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PIX_API_PORT ? process.env.PIX_API_PORT : 3000}`,
        xfwd: true,
      },
    },
  },
});
