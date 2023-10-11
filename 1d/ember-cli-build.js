'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const sourceMapConfig = {
  production: 'source-map',
  test: '',
  default: 'eval-source-map',
};

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    sourcemaps: { enabled: true },
    sassOptions: {
      includePaths: ['node_modules/@1024pix/pix-ui/addon/styles'],
    },
    babel: {
      sourceMaps: 'inline',
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
    },

    'ember-cli-babel': {
      includePolyfill: true,
    },
    '@embroider/macros': {
      setConfig: {
        '@ember-data/store': {
          polyfillUUID: true,
        },
      },
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

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        devtool: sourceMapConfig[process.env.NODE_ENV] ?? sourceMapConfig.default,
      },
    },
  });
};
