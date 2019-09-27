'use strict';

module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'pix-certif',
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
      API_HOST: process.env.API_HOST || '',
    },

    googleFonts: [
      'Roboto:300,400,700,900', // main font
      'Open+Sans:300',
    ],

    moment: {
      // To cherry-pick specific locale support into your application.
      // Full list of locales: https://github.com/moment/moment/tree/2.10.3/locale
      includeLocales: ['fr']
    },

    // Set or update content security policies
    contentSecurityPolicy: {
      'default-src': '\'none\'',
      'script-src': '\'self\' www.google-analytics.com \'unsafe-inline\' \'unsafe-eval\' cdn.ravenjs.com',
      'font-src': '\'self\' fonts.gstatic.com',
      'connect-src': '\'self\' www.google-analytics.com app.getsentry.com',
      'img-src': '\'self\' app.getsentry.com',
      'style-src': '\'self\' fonts.googleapis.com',
      'media-src': '\'self\'',
    },

    matomo: {
      url: 'https://stats.pix.fr/js/container_cMIdKogu.js',
    },

    notifications: {
      autoClear: true,
      clearDuration: 3000,
    },
  };

  if (environment === 'development') {
    ENV.APP.API_HOST = 'http://localhost:3000';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.matomo.debug = true;
  }

  if (environment === 'test') {
    ENV.APP.API_HOST = 'http://localhost:3000';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.notifications.autoClear = null;
    ENV.notifications.clearDuration = null;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    //ENV.APP.API_HOST = 'https://pix.fr/api';
  }

  return ENV;
};
