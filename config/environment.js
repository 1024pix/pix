/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'pix-live',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      // XXX because of a deprecation notice in the console
      EXTEND_PROTOTYPES: {
        Date: false,
      },
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      // PIX-API
      PIX_API_NAMESPACE: 'api/live'
    }
  };

  if (environment === 'development') {
    // LOG
    ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    // PIX-API
    ENV.APP.PIX_API_HOST = 'http://localhost:4200';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    // PIX-API
    ENV.APP.PIX_API_HOST = 'http://localhost:4200';
  }

  if (environment === 'staging') {
    // PIX-API
    ENV.APP.PIX_API_HOST = 'http://localhost:9000';
  }

  if (environment === 'production') {
    // PIX-API
    ENV.APP.PIX_API_HOST = 'https://api.pix-app.ovh';
  }

  return ENV;
};
