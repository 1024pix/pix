'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: ['node_modules/@1024pix/pix-ui/addon/styles'],
    },
    sourcemaps: { enabled: true },
    babel: {
      sourceMaps: 'inline',
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
    },

    flatpickr: {
      locales: ['fr'],
    },

    'ember-dayjs': {
      locales: ['fr'],
    },
  });

  app.import('vendor/AmpleSoft-normal.js', {
    using: [{ transformation: 'es6', as: 'AmpleSoft-normal.js' }],
  });

  app.import('vendor/AmpleSoft-bold.js', {
    using: [{ transformation: 'es6', as: 'AmpleSoft-bold.js' }],
  });

  app.import('vendor/Roboto-normal.js', {
    using: [{ transformation: 'es6', as: 'Roboto-normal.js' }],
  });

  app.import('vendor/Roboto-condensed.js', {
    using: [{ transformation: 'es6', as: 'Roboto-condensed.js' }],
  });

  app.import('vendor/Roboto-condensedBold.js', {
    using: [{ transformation: 'es6', as: 'Roboto-condensedBold.js' }],
  });

  app.import('vendor/Roboto-condensedLight.js', {
    using: [{ transformation: 'es6', as: 'Roboto-condensedLight.js' }],
  });

  app.import('vendor/pdf-assets.js', {
    using: [{ transformation: 'es6', as: 'pdf-assets.js' }],
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
  return app.toTree();
};
