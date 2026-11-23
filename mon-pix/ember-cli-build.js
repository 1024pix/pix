'use strict';
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const sourceMapConfig = {
  production: 'source-map',
  test: false,
  default: 'eval-source-map',
};

const { compatBuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const { setConfig } = await import('@warp-drive/build-config');
  const app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: ['node_modules/@1024pix/nebulix-ember/dist/styles', 'app/components'],
    },
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    fingerprint: {
      exclude: ['png', 'svg'],
      extensions: ['js', 'css', 'jpg', 'gif', 'map'],
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
  });

  setConfig(app, __dirname, {
    deprecations: {
      DEPRECATE_TRACKING_PACKAGE: false,
    },
    polyfillUUID: true,
  });

  return compatBuild(app, buildOnce, {
    staticModifiers: true,
    staticHelpers: app.env === 'production',
    staticComponents: app.env === 'production',
    packagerOptions: {
      webpackConfig: {
        devtool: sourceMapConfig[process.env.CI ? 'test' : (process.env.NODE_ENV ?? 'default')],
      },
    },
  });
};
