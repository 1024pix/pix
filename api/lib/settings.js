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

    mailjet: {
      apiKey: process.env.MAILJET_KEY,
      apiSecret: process.env.MAILJET_SECRET
    },

    googleReCaptcha: {
      secret: process.env.RECAPTCHA_KEY
    }
  };

  if(process.env.NODE_ENV === 'test') {
    config.port = null;

    config.airtable = {
      apiKey: 'test-api-key',
      base: 'test-base'
    };

    config.mailjet = {
      apiKey: 'test-api-ket',
      apiSecret: 'test-api-secret'
    };

    config.googleReCaptcha = {
      secret: 'test-recaptcha-key'
    };
  }

  return config;

})();
