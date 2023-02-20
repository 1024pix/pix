import samlController from './saml-controller';

export const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/saml/metadata.xml',
      config: {
        auth: false,
        handler: samlController.metadata,
        tags: ['api'],
      },
    },

    {
      method: 'GET',
      path: '/api/saml/login',
      config: {
        auth: false,
        handler: samlController.login,
        tags: ['api'],
      },
    },

    {
      method: 'POST',
      path: '/api/saml/assert',
      config: {
        auth: false,
        handler: samlController.assert,
        tags: ['api'],
      },
    },
  ]);
};

export const name = 'saml-api';
