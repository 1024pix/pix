'use strict';
require('dotenv').config();

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

/* eslint max-statements: off */
module.exports = function (environment) {
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
        Function: false,
        String: false,
        Array: true,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: process.env.API_HOST || '',
      FT_FOCUS_CHALLENGE_ENABLED: _isFeatureEnabled(process.env.FT_FOCUS_CHALLENGE_ENABLED) || false,
      isChallengeTimerEnable: true,
      MESSAGE_DISPLAY_DURATION: 1500,
      isMobileSimulationEnabled: false,
      isTimerCountdownEnabled: true,
      isMessageStatusTogglingEnabled: true,
      LOAD_EXTERNAL_SCRIPT: true,
      NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS: 5,
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS',
        defaultValue: 8,
        minValue: 1,
      }),
      MILLISECONDS_BEFORE_MAIL_RESEND: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'MILLISECONDS_BEFORE_MAIL_RESEND',
        defaultValue: 7000,
        minValue: 0,
      }),
      BANNER_CONTENT: process.env.BANNER_CONTENT || '',
      BANNER_TYPE: process.env.BANNER_TYPE || '',
      FRENCH_NEW_LEVEL_MESSAGE: process.env.FRENCH_NEW_LEVEL_MESSAGE || '',
      ENGLISH_NEW_LEVEL_MESSAGE: process.env.ENGLISH_NEW_LEVEL_MESSAGE || '',
      IS_PROD_ENVIRONMENT: (process.env.REVIEW_APP === 'false' && environment === 'production') || false,
      EMBED_ALLOWED_ORIGINS: (
        process.env.EMBED_ALLOWED_ORIGINS || 'https://epreuves.pix.fr,https://1024pix.github.io'
      ).split(','),

      API_ERROR_MESSAGES: {
        BAD_REQUEST: {
          CODE: '400',
          I18N_KEY: 'common.api-error-messages.bad-request-error',
        },
        LOGIN_UNAUTHORIZED: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-error',
        },
        USER_IS_TEMPORARY_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-temporary-blocked-error',
        },
        USER_IS_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-blocked-error',
        },
        INTERNAL_SERVER_ERROR: {
          CODE: '500',
          I18N_KEY: 'common.api-error-messages.internal-server-error',
        },
        BAD_GATEWAY: {
          CODE: '502',
          I18N_KEY: 'common.api-error-messages.internal-server-error',
        },
        GATEWAY_TIMEOUT: {
          CODE: '504',
          I18N_KEY: 'common.api-error-messages.gateway-timeout-error',
        },
      },
      AUTHENTICATED_SOURCE_FROM_GAR: 'external',
      NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD',
        defaultValue: 48,
        minValue: 1,
      }),
    },

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    showdown: {
      openLinksInNewWindow: true,
      strikethrough: true,
    },

    matomo: {},

    '@sentry/ember': {
      disablePerformance: true,
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || 'development',
        maxBreadcrumbs: _getEnvironmentVariableAsNumber({
          environmentVariable: process.env.SENTRY_MAX_BREADCRUMBS,
          defaultValue: 100,
          minValue: 100,
        }),
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
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.isChallengeTimerEnable = false;
    ENV.APP.MESSAGE_DISPLAY_DURATION = 0;
    ENV.APP.isMobileSimulationEnabled = true;
    ENV.APP.isTimerCountdownEnabled = false;
    ENV.APP.isMessageStatusTogglingEnabled = false;
    ENV.APP.LOAD_EXTERNAL_SCRIPT = false;
    ENV.APP.FT_FOCUS_CHALLENGE_ENABLED = true;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
    }
  }

  return ENV;
};
