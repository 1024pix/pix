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
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    fingerprint: {
      exclude: ['png', 'svg'],
      extensions: ['js', 'css', 'jpg', 'gif', 'map'],
    },
    'ember-dayjs': {
      locales: ['fr', 'en'],
      plugins: ['duration', 'relativeTime'],
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

  return app.toTree();
};
