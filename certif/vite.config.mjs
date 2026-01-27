import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import url from 'postcss-url';
import { NodePackageImporter } from 'sass-embedded';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  server: {
    port: 4203,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        xfwd: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        importers: [
          new NodePackageImporter(),
          {
            findFileUrl(url) {
              if (url.startsWith('pix-design-token')) {
                return new URL(`file://${process.cwd()}/node_modules/@1024pix/pix-ui/addon/styles/${url}`);
              }
              return null;
            },
          },
        ],
      },
    },
    postcss: {
      plugins: [
        url({
          url: (asset) => {
            if (asset.url.startsWith('../@1024pix/')) {
              return asset.url.replace('..', '');
            }
            return undefined;
          },
        }),
      ],
    },
  },
}));
