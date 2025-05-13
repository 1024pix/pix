import pkg from '@embroider/compat';
import { Webpack } from '@embroider/webpack';
import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';

const { compatBuild } = pkg;

const sourceMapConfig = {
  production: 'source-map',
  test: false,
  default: 'eval-source-map',
};

export default function (defaults) {
  const app = new EmberApp(defaults, {
    emberData: {
      deprecations: {
        // New projects can safely leave this deprecation disabled.
        // If upgrading, to opt-into the deprecated behavior, set this to true and then follow:
        // https://deprecations.emberjs.com/id/ember-data-deprecate-store-extends-ember-object
        // before upgrading to Ember Data 6.0
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },
    sassOptions: {
      includePaths: ['node_modules/@1024pix/pix-ui/addon/styles', 'app/components'],
    },
    'ember-cli-template-lint': {
      testGenerator: 'qunit', // or 'mocha', etc.
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
  return compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        devtool: sourceMapConfig[process.env.CI ? 'test' : (process.env.NODE_ENV ?? 'default')],
      },
    },
  });
}
