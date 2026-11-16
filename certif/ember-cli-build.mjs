import { compatBuild } from '@embroider/compat';
import { setConfig } from '@warp-drive/build-config';
import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';

const sourceMapConfig = {
  production: 'source-map',
  test: false,
  default: 'eval-source-map',
};

export default async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');
  const app = new EmberApp(defaults, {
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit',
    },
    '@embroider/macros': {
      setConfig: {
        'ember-qunit': {
          theme: 'ember',
        },
      },
    },
  });

  setConfig(app, import.meta.dirname, {
    deprecations: {
      DEPRECATE_TRACKING_PACKAGE: false,
    },
    polyfillUUID: true,
  });

  return compatBuild(app, buildOnce, {
    staticModifiers: true,
    packagerOptions: {
      webpackConfig: {
        devtool: sourceMapConfig[process.env.CI ? 'test' : (process.env.NODE_ENV ?? 'default')],
      },
    },
  });
}
