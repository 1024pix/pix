'use strict';

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(`Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`);
}

module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'pix-admin',
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
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: process.env.API_HOST || '',
      API_ERROR_MESSAGES : {
        BAD_REQUEST: { CODE: '400', MESSAGE: 'Les données envoyées ne sont pas au bon format.' },
        INTERNAL_SERVER_ERROR: {
          CODE: '500',
          MESSAGE: 'Le service est momentanément indisponible. Veuillez réessayer ultérieurement.'
        },
        GATEWAY_TIMEOUT: {
          CODE: '504',
          MESSAGE: 'Le service subi des ralentissements. Veuillez réessayer ultérieurement.'
        },
        UNAUTHORIZED: { CODE: '401', MESSAGE: 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.' },
        FORBIDDEN: '403',
        NOT_FOUND: '404',
      },
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({ environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS', defaultValue: 8, minValue: 1 }),
    },

    googleFonts: [
      'Raleway',
      'Open+Sans',
    ],

    // Set or update content security policies
    contentSecurityPolicy: {
      'default-src': '\'none\'',
      'script-src': '\'self\' www.google-analytics.com',
      'font-src': '\'self\' fonts.gstatic.com',
      'connect-src': '\'self\' www.google-analytics.com',
      'img-src': '\'self\'',
      'style-src': '\'self\' fonts.googleapis.com',
      'media-src': '\'self\''
    },

    'ember-cli-notifications': {
      autoClear: true,
      includeFontAwesome: true,
    },

    matomo: {
      url: 'https://stats.pix.fr/js/container_x4fRiAXl.js',
    },

    fontawesome: {
      warnIfNoIconsIncluded: true,
    },

  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.matomo.url = 'https://stats.pix.fr/js/container_x4fRiAXl_dev_a6c96fc927042b6f6e773267.js';
    ENV.matomo.debug = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';
    ENV.APP.API_HOST = 'http://localhost:3000';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV['ember-cli-notifications'] = {
      clearDuration: 300
    };
  }

  ENV.APP.ODS_PARSING_URL = 'api/sessions/session_id/certifications/attendance-sheet-analysis';

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
