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
      PIX_APP_URL_WITHOUT_EXTENSION: process.env.PIX_APP_URL_WITHOUT_EXTENSION || 'https://app.pix.',
      API_ERROR_MESSAGES: {
        BAD_REQUEST: {
          CODE: '400',
          I18N_KEY: 'common.api-error-messages.bad-request-error',
        },
        LOGIN_UNAUTHORIZED: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-error',
        },
        SHOULD_CHANGE_PASSWORD: {
          CODE: '401',
          I18N_KEY: 'pages.login.errors.should-change-password',
        },
        USER_IS_TEMPORARY_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-temporary-blocked-error',
        },
        USER_IS_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-blocked-error',
        },
        NOT_LINKED_CERTIFICATION: {
          CODE: '403',
          I18N_KEY: 'pages.login-or-register.login-form.errors.status.403',
        },
        FORBIDDEN: '403',
        NOT_FOUND: '404',
        INTERNAL_SERVER_ERROR: {
          CODE: '500',
          I18N_KEY: 'common.api-error-messages.internal-server-error',
        },
        GATEWAY_TIMEOUT: {
          CODE: '504',
          I18N_KEY: 'common.api-error-messages.gateway-timeout-error',
        },
      },
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS',
        defaultValue: 8,
        minValue: 1,
      }),
      sessionSupervisingPollingRate: process.env.SESSION_SUPERVISING_POLLING_RATE ?? 5000,
      COOKIE_LOCALE_LIFESPAN_IN_SECONDS: 31536000, // 1 year in seconds
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
