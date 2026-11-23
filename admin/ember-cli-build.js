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

  const app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: ['node_modules/@1024pix/nebulix-ember/dist/styles', 'app/components'],
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
    },
  });

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    deprecations: {
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  return compatBuild(app, buildOnce, {
    staticModifiers: true,
    packagerOptions: {
      webpackConfig: {
        devtool: sourceMapConfig[process.env.CI ? 'test' : (process.env.NODE_ENV ?? 'default')],
      },
    },
  });
};
