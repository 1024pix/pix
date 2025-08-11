'use strict';
const _ = require('lodash');

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

const ACTIVE_FEATURE_TOGGLES = [];

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'pix-certif',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: false,
    },

    APP: {
      API_HOST: process.env.API_HOST || '',
      APPLICATION_NAME: process.env.APP || 'pix-certif-local',
      DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'en',
      SUPPORTED_LOCALES: ['en', 'fr', 'fr-FR', 'fr-BE'],
      BANNER: {
        CONTENT: process.env.BANNER_CONTENT || '',
        TYPE: process.env.BANNER_TYPE || '',
      },
      INFORMATION_BANNER_POLLING_TIME:
        1000 *
        _getEnvironmentVariableAsNumber({
          environmentVariableName: process.env.INFORMATION_BANNER_POLLING_TIME,
          defaultValue: 60,
          minValue: 10,
        }),
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
      MILLISECONDS_BEFORE_MAIL_RESEND: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'MILLISECONDS_BEFORE_MAIL_RESEND',
        defaultValue: 5000,
        minValue: 0,
      }),
      sessionSupervisingPollingRate: process.env.SESSION_SUPERVISING_POLLING_RATE ?? 5000,
      COOKIE_LOCALE_LIFESPAN_IN_SECONDS: 31536000, // 1 year in seconds
      APP_VERSION: process.env.SOURCE_VERSION || 'development',
    },

    'ember-cli-mirage': {
      enabled: false,
    },

    'ember-inputmask5': {
      defaults: { showMaskOnHover: false },
    },
  };

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    ENV.APP.API_HOST = 'http://localhost:3000';

    ENV.APP.DEFAULT_LOCALE = 'fr';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.autoboot = false;
    ENV.APP.rootElement = '#ember-testing';

    ENV['ember-cli-mirage'] = {
      enabled: true,
      usingProxy: false,
    };
  }

  // Warn for unknown feature toggles
  _.each(process.env, (value, key) => {
    if (key.startsWith('FT_') && _.indexOf(ACTIVE_FEATURE_TOGGLES, key) === -1) {
      console.warn(`Unknown feature toggle ${key}. Please remove it from your environment variables.`);
    }
  });

  return ENV;
};
