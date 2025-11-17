import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({ babelHelpers: 'runtime', extensions }),
  ],
  server: {
    port: 4202,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        xfwd: true,
      },
    },
  },
});
