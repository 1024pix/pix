/* jshint node: true */

module.exports = function(environment) {
  const ENV = {

    modulePrefix: 'pix-live',
    environment: environment,
    rootURL: '/',
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
      API_HOST: '',
      isChallengeTimerEnable: true,
      MESSAGE_DISPLAY_DURATION: 1500,
      isMobileSimulationEnabled: false,
      isTimerCountdownEnabled: true,
      isMessageStatusTogglingEnabled: true,
      LOAD_EXTERNAL_SCRIPT: true,
      GOOGLE_RECAPTCHA_KEY: '6LdPdiIUAAAAADhuSc8524XPDWVynfmcmHjaoSRO',
      SCROLL_DURATION: 800
    },

    googleFonts: [
      'Lato:300,400,700,900', // main font, Challenge instructions
      'Open+Sans', // used for ex. on buttons
      'Raleway:100,300,400,600,700,800', // used for index page titles
      'Overpass' //used on the trophy
    ],

    // Set or update content security policies
    contentSecurityPolicy: {
      'font-src': '\'self\' fonts.gstatic.com',
      'style-src': '\'self\' fonts.googleapis.com'
    },

    showdown: {
      openLinksInNewWindow: true
    }
  };

  if (environment === 'development') {
    // LOG
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    // Redefined in custom initializer 'initializers/configure-pix-api-host.js'
    ENV.APP.API_HOST = 'http://localhost:3000';
  }

  if (environment === 'test') {
    ENV.EmberENV.useDelay = false;

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.googleFonts = null;
    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.isChallengeTimerEnable = false;
    ENV.APP.MESSAGE_DISPLAY_DURATION = 0;
    ENV.APP.isMobileSimulationEnabled = true;
    ENV.APP.isTimerCountdownEnabled = false;
    ENV.APP.isMessageStatusTogglingEnabled = false;
    ENV.APP.LOAD_EXTERNAL_SCRIPT = false;
  }

  if (environment === 'integration') {
    ENV.metricsAdapters = [
      {
        name: 'Piwik',
        environments: ['integration'],
        config: {
          piwikUrl: '//stats.data.gouv.fr',
          siteId: 30
        }
      }
    ];
  }

  if (environment === 'staging') {
    ENV.metricsAdapters = [
      {
        name: 'Piwik',
        environments: ['staging'],
        config: {
          piwikUrl: '//stats.data.gouv.fr',
          siteId: 31
        }
      }
    ];
  }

  if (environment === 'production') {
    ENV.metricsAdapters = [
      {
        name: 'Piwik',
        environments: ['production'],
        config: {
          piwikUrl: '//stats.data.gouv.fr',
          siteId: 29
        }
      }
    ];
  }

  return ENV;
};
