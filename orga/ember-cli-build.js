'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    sourcemaps: { enabled: true },
    babel: {
      sourceMaps: 'inline',
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
    },

    'ember-cli-babel': {
      includePolyfill: true,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('node_modules/chart.js/dist/chart.js', {
    using: [{ transformation: 'amd', as: 'chart.js' }],
  });

  app.import('node_modules/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.js', {
    using: [{ transformation: 'amd', as: 'chartjs-adapter-date-fns.js' }],
  });

  app.import('node_modules/patternomaly/dist/patternomaly.js', {
    using: [{ transformation: 'amd', as: 'patternomaly.js' }],
  });

  return app.toTree();
};
