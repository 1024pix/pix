'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'pix-orga',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },


    APP: {
      API_HOST: process.env.API_HOST
    },

    googleFonts: [
      'Roboto:300,400,700,900', // main font
    ],

    contentSecurityPolicy: {
      // Google fonts: https://github.com/damiencaselli/ember-cli-google-fonts#declare-fonts
      'font-src': '\'self\' fonts.gstatic.com',
      'style-src': '\'self\' fonts.googleapis.com',
    },
  };

  if (environment === 'development') {
    ENV.APP.API_HOST= 'http://localhost:3000/api'
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.APP.API_HOST= 'http://localhost:3000/api';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    //ENV.APP.API_HOST = 'https://pix.fr/api';
  }

  return ENV;
};
