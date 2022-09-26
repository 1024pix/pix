'use strict';
const _ = require('lodash');

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(
    `Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`
  );
}

function _isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

const ACTIVE_FEATURE_TOGGLES = [];

module.exports = function (environment) {
  const analyticsEnabled = _isFeatureEnabled(process.env.WEB_ANALYTICS_ENABLED);
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
        Date: false,
      },
    },

    APP: {
      API_HOST: process.env.API_HOST || '',
      BANNER: {
        CONTENT: process.env.BANNER_CONTENT || '',
        TYPE: process.env.BANNER_TYPE || '',
      },
      API_ERROR_MESSAGES: {
        BAD_REQUEST: { CODE: '400', MESSAGE: 'Les données envoyées ne sont pas au bon format.' },
        INTERNAL_SERVER_ERROR: {
          CODE: '500',
          MESSAGE: 'Le service est momentanément indisponible. Veuillez réessayer ultérieurement.',
        },
        GATEWAY_TIMEOUT: {
          CODE: '504',
          MESSAGE: 'Le service subi des ralentissements. Veuillez réessayer ultérieurement.',
        },
        UNAUTHORIZED: { CODE: '401', MESSAGE: "L'adresse e-mail et/ou le mot de passe saisis sont incorrects." },
        FORBIDDEN: '403',
        NOT_FOUND: '404',
      },
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS',
        defaultValue: 8,
        minValue: 1,
      }),
      sessionSupervisingPollingRate: process.env.SESSION_SUPERVISING_POLLING_RATE ?? 5000,
    },

    moment: {
      // To cherry-pick specific locale support into your application.
      // Full list of locales: https://github.com/moment/moment/tree/2.10.3/locale
      includeLocales: ['fr'],
    },

    matomo: {},

    formBuilderLinkUrl: 'https://form-eu.123formbuilder.com/41052/form',
    urlToDownloadSessionIssueReportSheet: 'https://cloud.pix.fr/s/B76yA8ip9Radej9/download',
  };

  if (environment === 'development') {
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
      ENV.matomo.debug = true;
    }
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    ENV.APP.API_HOST = 'http://localhost:3000';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.autoboot = false;
    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
    }
  }

  // Warn for unknown feature toggles
  _.each(process.env, (value, key) => {
    if (key.startsWith('FT_') && _.indexOf(ACTIVE_FEATURE_TOGGLES, key) === -1) {
      // eslint-disable-next-line no-console
      console.warn(`Unknown feature toggle ${key}. Please remove it from your environment variables.`);
    }
  });

  return ENV;
};
