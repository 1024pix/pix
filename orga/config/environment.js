'use strict';

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(`Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`);
}

function _isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

module.exports = function(environment) {
  const analyticsEnabled = _isFeatureEnabled(process.env.WEB_ANALYTICS_ENABLED);
  const ENV = {
    modulePrefix: 'pix-orga',
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
      CAMPAIGNS_ROOT_URL: process.env.CAMPAIGNS_ROOT_URL,
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({ environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS', defaultValue: 8, minValue: 1 }),
      PIX_APP_URL_WITHOUT_EXTENSION: process.env.PIX_APP_URL_WITHOUT_EXTENSION || 'https://app.pix.',
      IS_DISSOCIATE_BUTTON_ENABLED: _isFeatureEnabled(process.env.IS_DISSOCIATE_BUTTON_ENABLED),
    },

    googleFonts: [
      'Roboto:300,400,500,700,900', // main font
      'Open+Sans:300,400,600,700',
    ],

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    moment: {
      includeLocales: ['fr'],
    },

    // Set or update content security policies
    contentSecurityPolicy: {
      'default-src': '\'none\'',
      'script-src': '\'self\' www.google-analytics.com \'unsafe-inline\' \'unsafe-eval\' cdn.ravenjs.com',
      'font-src': '\'self\' fonts.gstatic.com',
      'connect-src': '\'self\' www.google-analytics.com',
      'img-src': '\'self\'',
      'style-src': '\'self\' fonts.googleapis.com',
      'media-src': '\'self\'',
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
  };

  if (environment === 'development') {
    ENV.APP.CAMPAIGNS_ROOT_URL = 'http://localhost:4200/campagnes/';
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
    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.CAMPAIGNS_ROOT_URL = 'http://localhost:4200/campagnes/';
    ENV.APP.IS_DISSOCIATE_BUTTON_ENABLED = true;

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
    if (analyticsEnabled) {
      ENV.matomo.url = process.env.WEB_ANALYTICS_URL;
    }
  }

  return ENV;
};
