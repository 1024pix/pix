'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { compatBuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, {
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
    },
    emberData: {
      deprecations: {
        DEPRECATE_RELATIONSHIP_REMOTE_UPDATE_CLEARING_LOCAL_STATE: false,
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },
  });

  return compatBuild(app, buildOnce);
};
