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
  const analyticsEnabled = _isFeatureEnabled(process.env.ANALYTICS_ENABLED);
  const ENV = {
    modulePrefix: 'pix-orga',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
    },

    APP: {
      API_HOST: process.env.API_HOST || '',
      APPLICATION_NAME: process.env.APP || 'pix-orga-local',
      DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'en',
      SUPPORTED_LOCALES: [
        { value: 'de-AT', nativeName: 'Deutsch (Österreich)', displayedInSwitcher: true },
        { value: 'en', nativeName: 'English', displayedInSwitcher: true },
        { value: 'es', nativeName: 'Español', displayedInSwitcher: true },
        { value: 'fr', nativeName: 'Français', displayedInSwitcher: true },
        { value: 'fr-BE', nativeName: 'Français (Belgique)', displayedInSwitcher: true },
        { value: 'fr-FR', nativeName: 'Français (France)', displayedInSwitcher: false },
        { value: 'it', nativeName: 'Italiano', displayedInSwitcher: true },
        { value: 'nl', nativeName: 'Nederlands', displayedInSwitcher: false },
        { value: 'nl-BE', nativeName: 'Nederlands (België)', displayedInSwitcher: true },
      ],
      BANNER_CONTENT: process.env.BANNER_CONTENT || '',
      CERTIFICATION_BANNER_DISPLAY_DATES: process.env.CERTIFICATION_BANNER_DISPLAY_DATES || '',
      BANNER_TYPE: process.env.BANNER_TYPE || '',
      INFORMATION_BANNER_POLLING_TIME:
        1000 *
        _getEnvironmentVariableAsNumber({
          environmentVariableName: process.env.INFORMATION_BANNER_POLLING_TIME,
          defaultValue: 60,
          minValue: 10,
        }),
      CAMPAIGNS_ROOT_URL: process.env.CAMPAIGNS_ROOT_URL,
      COMBINED_COURSES_ROOT_URL: process.env.COMBINED_COURSES_ROOT_URL,

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
        INTERNAL_SERVER_ERROR: {
          CODE: '500',
          I18N_KEY: 'common.api-error-messages.internal-server-error',
        },
        GATEWAY_TIMEOUT: {
          CODE: '504',
          I18N_KEY: 'common.api-error-messages.internal-server-error',
        },
      },
      COOKIE_LOCALE_LIFESPAN_IN_SECONDS: 31536000, // 1 year in seconds
      APP_VERSION: process.env.SOURCE_VERSION || 'development',
      SURVEY_LINK: process.env.SURVEY_ORGA_LINK || null,
      SURVEY_BANNER_ENABLED: _isFeatureEnabled(process.env.SURVEY_ORGA_BANNER_ENABLED),
    },

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },
    pagination: {
      debounce: 500,
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
  };

  if (environment === 'development') {
    ENV.APP.CAMPAIGNS_ROOT_URL = 'http://localhost:4200/campagnes/';
    ENV.APP.COMBINED_COURSES_ROOT_URL = 'http://localhost:4200/parcours/';
    ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES = '04 05 06 07';
    ENV.APP.SURVEY_LINK = 'http://localhost:4200/campagnes/';
    ENV.APP.SURVEY_BANNER_ENABLED = true;
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    ENV.APP.API_HOST = 'http://localhost:3000';

    ENV.APP.DEFAULT_LOCALE = 'fr';

    ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES = '04 05 06 07';
    ENV.APP.CAMPAIGNS_ROOT_URL = 'http://localhost:4200/campagnes/';
    ENV.APP.COMBINED_COURSES_ROOT_URL = 'http://localhost:4200/parcours/';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.pagination.debounce = 0;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
