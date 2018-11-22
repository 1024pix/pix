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
      API_HOST: process.env.API_HOST || '',
      CAMPAIGNS_ROOT_URL: process.env.CAMPAIGNS_ROOT_URL || 'https://app.pix.fr/campagnes/',
    },

    googleFonts: [
      'Roboto:300,400,700,900', // main font
      'Open+Sans:300',
    ],

    metricsAdapters: [
      {
        name: 'Piwik',
        environments: ['all'],
        config: {
          piwikUrl: '//stats.pix.fr',
          siteId: 5
        }
      }
    ],

    // Set or update content security policies
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' www.google-analytics.com 'unsafe-inline' 'unsafe-eval' cdn.ravenjs.com",
      'font-src': "'self' fonts.gstatic.com",
      'connect-src': "'self' www.google-analytics.com app.getsentry.com",
      'img-src': "'self' app.getsentry.com",
      'style-src': "'self' fonts.googleapis.com",
      'media-src': "'self'",
    },
  };

  if (environment === 'development') {
    ENV.APP.API_HOST= 'http://localhost:3000';
    ENV.APP.CAMPAIGNS_ROOT_URL= 'http://localhost:4200/campagnes/';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.APP.API_HOST= 'http://localhost:3000';
    ENV.APP.CAMPAIGNS_ROOT_URL= 'http://localhost:4200/campagnes/';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    ENV.APP.CAMPAIGNS_ROOT_URL= 'https://app.pix.fr/campagnes/';
    // here you can enable a production-specific feature
    //ENV.APP.API_HOST = 'https://pix.fr/api';
  }

  return ENV;
};
