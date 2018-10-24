const samlController = require('./saml-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/saml/metadata.xml',
      config: {
        auth: false,
        handler: samlController.metadata,
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/api/saml/login',
      config: {
        auth: false,
        handler: samlController.login,
        tags: ['api']
      }
    },

    {
      method: 'POST',
      path: '/api/saml/assert',
      config: {
        auth: false,
        handler: samlController.assert,
        tags: ['api']
      }
    },
  ]);

  return next();
};

exports.register.attributes = {
  name: 'saml-api',
  version: '1.0.0'
};
