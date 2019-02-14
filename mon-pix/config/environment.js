'use strict';

/* eslint max-statements: off */
module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'mon-pix',
    environment: environment,
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
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: process.env.API_HOST || '',
      HOME_HOST: 'https://pix.fr',
      isChallengeTimerEnable: true,
      MESSAGE_DISPLAY_DURATION: 1500,
      isMobileSimulationEnabled: false,
      isTimerCountdownEnabled: true,
      isMessageStatusTogglingEnabled: true,
      LOAD_EXTERNAL_SCRIPT: true,
      GOOGLE_RECAPTCHA_KEY: '6LdPdiIUAAAAADhuSc8524XPDWVynfmcmHjaoSRO',
      SCROLL_DURATION: 800,
      useDelay: true,
      NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT: 5
    },

    googleFonts: [
      'Lato:300,400,700,900', // main font, Challenge instructions
      'Open+Sans:300,400,600', // used for ex. on buttons
      'Raleway:100,300,400,600,700,800', // used for index page titles
      'Roboto:400,500', // used for campaign
      'Overpass' //used on the trophy
    ],

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    metricsAdapters: [
      {
        name: 'Piwik',
        environments: ['production'],
        config: {
          piwikUrl: 'https://stats.pix.fr/',
          siteId: 4
        }
      }
    ],

    // Set or update content security policies
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' www.google-analytics.com 'unsafe-inline' 'unsafe-eval' cdn.ravenjs.com",
      'font-src': "'self' fonts.gstatic.com",
      'connect-src': "'self' www.google-analytics.com",
      'img-src': "'self'",
      'style-src': "'self' fonts.googleapis.com",
      'media-src': "'self'"
    },

    showdown: {
      openLinksInNewWindow: true
    },

    sentry: {
      dsn: process.env.SENTRY_DSN,
      tags: {
        source: 'live'
      },
    },

    moment: {
      includeLocales: ['fr'],
    },
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    // Redefined in custom initializer 'initializers/configure-pix-api-host.js'
    ENV.APP.API_HOST = 'http://localhost:3000';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.googleFonts = null;
    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.isChallengeTimerEnable = false;
    ENV.APP.MESSAGE_DISPLAY_DURATION = 0;
    ENV.APP.isMobileSimulationEnabled = true;
    ENV.APP.isTimerCountdownEnabled = false;
    ENV.APP.isMessageStatusTogglingEnabled = false;
    ENV.APP.LOAD_EXTERNAL_SCRIPT = false;
    ENV.APP.useDelay = false;
    ENV.APP.GOOGLE_RECAPTCHA_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    ENV.RECAPTCHA_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
