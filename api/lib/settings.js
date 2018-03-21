const path = require('path');

module.exports = (function() {

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment: process.env.NODE_ENV || 'development',

    hapi: {
      options: {}
    },

    airtable: {
      apiKey: process.env.AIRTABLE_API_KEY,
      base: process.env.AIRTABLE_BASE
    },

    app: {
      domain: 'pix.beta.gouv.fr'
    },

    logging: {
      enabled: process.env.LOG_ENABLED,
      path: process.env.LOG_PATH || '/var/log/pix.log',
      colorEnabled: ('development' === process.env.NODE_ENV)
    },

    mailjet: {
      apiKey: process.env.MAILJET_KEY,
      apiSecret: process.env.MAILJET_SECRET
    },

    googleReCaptcha: {
      secret: process.env.RECAPTCHA_KEY
    },

    authentication: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: '7d'
    },

    temporaryKey: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: '1d',
      payload: 'PixResetPassword'
    },

    passwordValidationPattern: '^(?=.*\\p{L})(?=.*\\d).{8,}$'

  };

  if (process.env.NODE_ENV === 'test') {
    config.port = null;

    config.app.domain = 'localhost',

    config.airtable = {
      apiKey: 'test-api-key',
      base: 'test-base'
    };

    config.logging.enabled = false;

    config.mailjet = {
      apiKey: 'test-api-ket',
      apiSecret: 'test-api-secret'
    };

    config.googleReCaptcha = {
      secret: 'test-recaptcha-key'
    };

    config.authentication = {
      secret: 'test-jwt-key',
    };

    config.temporaryKey = {
      secret: 'test-jwt-key'
    };
  }

  return config;

})();
