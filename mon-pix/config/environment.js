'use strict';

require('dotenv').config();

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(
    `Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`,
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
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: process.env.API_HOST || '',
      APPLICATION_NAME: process.env.APP || 'pix-app-local',
      DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'en',
      FT_FOCUS_CHALLENGE_ENABLED: _isFeatureEnabled(process.env.FT_FOCUS_CHALLENGE_ENABLED) || false,
      isTimerCountdownEnabled: true,
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
      INFORMATION_BANNER_POLLING_TIME:
        1000 *
        _getEnvironmentVariableAsNumber({
          environmentVariableName: process.env.INFORMATION_BANNER_POLLING_TIME,
          defaultValue: 60,
          minValue: 10,
        }),
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
        USER_IS_TEMPORARY_BLOCKED_WITH_USERNAME: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-temporary-blocked-with-username-error',
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
        MISSING_OR_INVALID_CREDENTIALS: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-error',
        },
        MISSING_OR_INVALID_CREDENTIALS_WITH_USERNAME: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-with-user-name-error',
        },
        MISSING_OR_INVALID_CREDENTIALS_REMAINING_ATTEMPTS_WITH_USERNAME: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-remaining-attempts-with-user-name-error',
        },
        MISSING_OR_INVALID_CREDENTIALS_REMAINING_ATTEMPTS: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-remaining-attempts-error',
        },
      },
      AUTHENTICATED_SOURCE_FROM_GAR: 'external',
      COOKIE_LOCALE_LIFESPAN_IN_SECONDS: 31536000, // 1 year in seconds
      AUTONOMOUS_COURSES_ORGANIZATION_ID: parseInt(process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID, 10),
      APP_VERSION: process.env.SOURCE_VERSION || 'development',
    },

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    showdown: {
      openLinksInNewWindow: true,
      strikethrough: true,
    },

    metrics: {
      enabled: analyticsEnabled,
      matomoUrl: process.env.WEB_ANALYTICS_URL,
    },

    companion: {
      disabled: false,
    },

    metricsAdapters: [
      {
        name: 'PlausibleAdapter',
        environments: analyticsEnabled ? ['all'] : [],
        config: {
          siteId: process.env.ANALYTICS_SITE_ID,
          scriptUrl: process.env.ANALYTICS_SCRIPT_URL,
        },
      },
    ],

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

    'ember-cli-mirage': {
      usingProxy: true,
    },
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID = 9000000;
    ENV.companion.disabled = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    ENV.APP.DEFAULT_LOCALE = 'fr';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.isTimerCountdownEnabled = false;
    ENV.APP.LOAD_EXTERNAL_SCRIPT = false;
    ENV.APP.FT_FOCUS_CHALLENGE_ENABLED = true;
    ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID = 999;
    ENV.metrics.enabled = false;

    ENV.companion.disabled = true;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }
  return ENV;
};
