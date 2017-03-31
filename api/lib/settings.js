const path = require('path');

module.exports = (function () {

  const config = {

    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment: process.env.NODE_ENV || 'development',

    hapi: {
      options: {}
    },

    airtable: {
      apiKey: 'keyEgu8JYhXaOhjbd',
      base: 'appHAIFk9u1qqglhX'
    },

    mailjet: {
      apiKey: process.env.MJ_KEY,
      apiSecret: process.env.MJ_SECRET
    }
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = null;

    config.airtable = {
      apiKey: 'test-api-key',
      base: 'test-base'
    };

    config.mailjet = {
      apiKey: 'test-api-ket',
      apiSecret: 'test-api-secret'
    };
  }

  return config;

})();
