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
        Date: false
      },
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      useDelay: true
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    googleFonts: [
      'Open+Sans:300,300i,400,400i,600,600i,700,700i',
      'Roboto:300,300i,400,400i,600,600i,700,700i'
    ],

    // Set or update content security policies
    contentSecurityPolicy: {
      'font-src': "'self' fonts.gstatic.com",
      'style-src': "'self' fonts.googleapis.com"
    }
  };

  if (environment === 'development') {
    // LOG
    ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.EmberENV.useDelay = false;

    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.googleFonts = [];
  }

  return ENV;
};
