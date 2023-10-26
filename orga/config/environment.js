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

function _isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

module.exports = function (environment) {
  const analyticsEnabled = _isFeatureEnabled(process.env.WEB_ANALYTICS_ENABLED);
  const ENV = {
    modulePrefix: 'pix-orga',
    podModulePrefix: 'pix-orga/pods',
    environment,
    rootURL: '/',
    locationType: 'history',
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
      BANNER_CONTENT: process.env.BANNER_CONTENT || '',
      CERTIFICATION_BANNER_DISPLAY_DATES: process.env.CERTIFICATION_BANNER_DISPLAY_DATES || '',
      BANNER_TYPE: process.env.BANNER_TYPE || '',
      CAMPAIGNS_ROOT_URL: process.env.CAMPAIGNS_ROOT_URL,
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
          I18N_KEY: 'pages.login-form.errors.should-change-password',
        },
        USER_IS_TEMPORARY_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-temporary-blocked-error',
        },
        USER_IS_BLOCKED: {
          CODE: '403',
          I18N_KEY: 'common.api-error-messages.login-user-blocked-error',
        },
        NOT_LINKED_ORGANIZATION: {
          CODE: '403',
          I18N_KEY: 'pages.login-form.errors.status.403',
        },
        USER_NOT_FOUND: {
          CODE: '404',
          I18N_KEY: 'pages.login-form.errors.status.404',
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
          I18N_KEY: 'common.api-error-messages.internal-server-error',
        },
      },
      COOKIE_LOCALE_LIFESPAN_IN_SECONDS: 31536000, // 1 year in seconds
    },

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    matomo: {},

    'ember-cli-notifications': {
      autoClear: true,
      clearDuration: 5000,
      includeFontAwesome: true,
    },

    pagination: {
      debounce: 500,
    },

    'ember-cli-mirage': {
      usingProxy: true,
    },
  };

  if (environment === 'development') {
    ENV.APP.FT_DELETE_PARTICIPANT = true;
    ENV.APP.CAMPAIGNS_ROOT_URL = 'http://localhost:4200/campagnes/';
    ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES = '04 05 06 07';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
      ENV.matomo.debug = true;
    }
  }

  if (environment === 'test') {
    ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES = '04 05 06 07';
    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.CAMPAIGNS_ROOT_URL = 'http://localhost:4200/campagnes/';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV['ember-cli-notifications'] = {
      autoClear: null,
      clearDuration: null,
    };

    ENV.pagination.debounce = 0;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    ENV.APP.FT_DELETE_PARTICIPANT = _isFeatureEnabled(process.env.FT_DELETE_PARTICIPANT) || false;

    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
    }
  }

  ENV['ember-component-css'] = {
    namespacing: false,
  };
  return ENV;
};
