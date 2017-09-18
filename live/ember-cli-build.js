/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    // To start using async / await in your Ember
    // XXX https://karolgalanciak.com/blog/2015/12/18/ember-and-es7-async-slash-await/
    'ember-cli-babel': {
      includePolyfill: true
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

  app.import('node_modules/bootstrap/dist/js/bootstrap.js');
  app.import('node_modules/bootstrap/dist/css/bootstrap.css');
  app.import('node_modules/js-yaml/dist/js-yaml.js');

  return app.toTree();
};
