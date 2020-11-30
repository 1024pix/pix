'use strict';

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(`Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`);
}

function _isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

/* eslint max-statements: off */
module.exports = function(environment) {
  const analyticsEnabled = _isFeatureEnabled(process.env.WEB_ANALYTICS_ENABLED);
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
        Date: false,
      },
    },

    'ember-simple-auth-oidc': {
      afterLogoutUri: process.env.POLE_EMPLOI_AFTER_LOGOUT_URI,
      authEndpoint: '/connexion/oauth2/authorize',
      clientId: process.env.POLE_EMPLOI_CLIENT_ID,
      endSessionEndpoint: '/compte/deconnexion',
      expiresIn: 60000, // Short expire time (60s) for testing purpose
      host: process.env.POLE_EMPLOI_AUTHENTICATION_URL,
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: process.env.API_HOST || '',
      isChallengeTimerEnable: true,
      MESSAGE_DISPLAY_DURATION: 1500,
      isMobileSimulationEnabled: false,
      isTimerCountdownEnabled: true,
      isMessageStatusTogglingEnabled: true,
      LOAD_EXTERNAL_SCRIPT: true,
      GOOGLE_RECAPTCHA_KEY: '6LdPdiIUAAAAADhuSc8524XPDWVynfmcmHjaoSRO',
      NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS: 5,
      IS_RECAPTCHA_ENABLED: _isFeatureEnabled(process.env.IS_RECAPTCHA_ENABLED),
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({ environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS', defaultValue: 8, minValue: 1 }),
      BANNER_CONTENT: process.env.BANNER_CONTENT || '',
      BANNER_TYPE: process.env.BANNER_TYPE || '',
      FT_IMPROVE_COMPETENCE_EVALUATION: process.env.FT_IMPROVE_COMPETENCE_EVALUATION || false,
      FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU: process.env.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU || false,
      REVIEW_APP: process.env.REVIEW_APP || false,

      API_ERROR_MESSAGES: {
        BAD_REQUEST: {
          CODE: '400',
          MESSAGE: 'api-error-messages.bad-request-error',
        },
        LOGIN_UNAUTHORIZED: {
          CODE: '401',
          MESSAGE: 'api-error-messages.login-unauthorized-error',
        },
        INTERNAL_SERVER_ERROR: {
          CODE: '500',
          MESSAGE: 'api-error-messages.internal-server-error',
        },
        BAD_GATEWAY: {
          CODE: '502',
          MESSAGE: 'api-error-messages.internal-server-error',
        },
        GATEWAY_TIMEOUT: {
          CODE: '504',
          MESSAGE: 'api-error-messages.internal-server-error',
        },
      },
      AUTHENTICATED_SOURCE_FROM_MEDIACENTRE: 'external',
    },

    googleFonts: [
      'Open+Sans:300,400,600', // used for ex. on buttons
      'Roboto:300,400,500', // used for campaign
      'Roboto+Mono', //used for monospaced needs
    ],

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    // Set or update content security policies
    contentSecurityPolicy: {
      'default-src': '\'none\'',
      'script-src': '\'self\' www.google-analytics.com \'unsafe-inline\' \'unsafe-eval\' cdn.ravenjs.com',
      'font-src': '\'self\' fonts.gstatic.com',
      'connect-src': '\'self\' www.google-analytics.com',
      'img-src': '\'self\'',
      'style-src': '\'self\' fonts.googleapis.com',
      'media-src': '\'self\'',
    },

    showdown: {
      openLinksInNewWindow: true,
    },

    moment: {
      // Locale supported by moment.js
      // English is bundled automatically, not need to add en in includeLocales
      includeLocales: ['fr'],
    },

    matomo: {},

    '@sentry/ember': {
      disablePerformance: true,
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: (process.env.SENTRY_ENVIRONMENT || 'development'),
        maxBreadcrumbs: _getEnvironmentVariableAsNumber({ environmentVariable: process.env.SENTRY_MAX_BREADCRUMBS, defaultValue: 100, minValue: 100 }),
        debug: _isFeatureEnabled(process.env.SENTRY_DEBUG),
        release: `v${process.env.npm_package_version}`,
      },
    },

    sentry: {
      enabled: _isFeatureEnabled(process.env.SENTRY_ENABLED),
    },
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    // Redefined in custom initializer 'initializers/configure-pix-api-host.js'
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
      ENV.matomo.debug = true;
    }
    ENV.APP.FT_IMPROVE_COMPETENCE_EVALUATION = true;

    ENV.APP.IS_POLE_EMPLOI_ENABLED = true;
    ENV['ember-simple-auth-oidc'].host = 'https://authentification-candidat.pole-emploi.fr',
    ENV['ember-simple-auth-oidc'].afterLogoutUri = 'http://localhost:8080/';
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
    ENV.APP.GOOGLE_RECAPTCHA_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    ENV.RECAPTCHA_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
    }
  }
  return ENV;
};
