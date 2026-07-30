'use strict';

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

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'pix-admin',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: false,
    },

    APP: {
      API_HOST: process.env.API_HOST || '',
      PIX_APP_URL_WITHOUT_EXTENSION: process.env.PIX_APP_URL_WITHOUT_EXTENSION || 'https://app.pix.',
      DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'en',
      SUPPORTED_LOCALES: [
        { value: 'en', nativeName: 'English', displayedInSwitcher: true },
        { value: 'fr', nativeName: 'Français', displayedInSwitcher: true },
        { value: 'fr-FR', nativeName: 'Français (France)', displayedInSwitcher: false },
      ],
      API_ERROR_MESSAGES: {
        BAD_REQUEST: {
          CODE: '400',
          I18N_KEY: 'common.api-error-messages.bad-request-error',
        },
        LOGIN_UNAUTHORIZED: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.login-unauthorized-error',
        },
        PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED: {
          CODE: '401',
          I18N_KEY: 'common.api-error-messages.pix-admin-login-from-password-disabled-error',
        },
        USER_IS_TEMPORARY_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-temporary-blocked-error',
        },
        USER_IS_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-blocked-error',
        },
        LOGIN_NO_PERMISSION: {
          CODE: '403',
          I18N_KEY: 'pages.login.api-error-messages.login-no-permission',
        },
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
      ORGANIZATION_DASHBOARD_URL: process.env.ORGANIZATION_DASHBOARD_URL,
      TARGET_PROFILE_DASHBOARD_URL: process.env.TARGET_PROFILE_DASHBOARD_URL,
      CERTIFICATION_CENTER_DASHBOARD_URL: process.env.CERTIFICATION_CENTER_DASHBOARD_URL,
      USER_DASHBOARD_URL: process.env.USER_DASHBOARD_URL,
      PIX_ASSETS_MANAGER_URL: process.env.PIX_ASSETS_MANAGER_URL,
      MAX_LEVEL: 8,
      MAX_REACHABLE_LEVEL: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'MAX_REACHABLE_LEVEL',
        defaultValue: 6,
        minValue: 6,
      }),
      APP_VERSION: process.env.SOURCE_VERSION || 'development',
    },

    'ember-cli-notifications': {
      autoClear: true,
      includeFontAwesome: true,
    },

    fontawesome: {
      warnIfNoIconsIncluded: true,
    },

    pagination: {
      debounce: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'RESEARCH_DEBOUNCE_TIMEOUT',
        defaultValue: 500,
        minValue: 250,
      }),
    },

    searchTargetProfiles: {
      debounce: _getEnvironmentVariableAsNumber({
        environmentVariableName: 'SEARCH_TARGET_PROFILE_DEBOUNCE_TIMEOUT',
        defaultValue: 250,
        minValue: 0,
      }),
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.TARGET_PROFILE_DASHBOARD_URL = 'https://exemple.net';
    ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL = 'https://example.net/id=';
    ENV.APP.ORGANIZATION_DASHBOARD_URL = 'https://example.net/id=';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';
    ENV.APP.API_HOST = 'http://localhost:3000';

    ENV.APP.DEFAULT_LOCALE = 'fr';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.TARGET_PROFILE_DASHBOARD_URL = 'https://example.net';
    ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL = 'https://example.net/id=';
    ENV.APP.ORGANIZATION_DASHBOARD_URL = 'https://example.net/id=';

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
    ENV.APP.PIX_ASSETS_MANAGER_URL = 'https://example-assets.net';
    ENV['ember-cli-notifications'] = {
      clearDuration: 300,
    };

    ENV.pagination.debounce = 0;
    ENV.searchTargetProfiles.debounce = 0;
  }
  return ENV;
};
