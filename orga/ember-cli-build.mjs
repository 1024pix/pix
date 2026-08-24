import { compatBuild } from '@embroider/compat';
import { setConfig } from '@warp-drive/build-config';
import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';

export default async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');
  const app = new EmberApp(defaults, {
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
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
  });
}
