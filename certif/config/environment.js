'use strict';
const _ = require('lodash');

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(`Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`);
}

const ACTIVE_FEATURE_TOGGLES = [];

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

    formBuilderLinkUrl: 'https://eu.123formbuilder.com/form-29080/certification-depot-du-pv-de-session-scanne',
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.matomo.url = 'https://stats.pix.fr/js/container_cMIdKogu_dev_ace719fc09829675a21c66df.js';
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

  // Warn for unknown feature toggles
  _.each(process.env, (value, key) => {
    if (key.startsWith('FT_') && _.indexOf(ACTIVE_FEATURE_TOGGLES, key) === -1) {
      console.warn(`Unknown feature toggle ${key}. Please remove it from your environment variables.`);
    }
  });

  return ENV;
};
