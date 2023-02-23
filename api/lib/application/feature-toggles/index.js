const featureToggleController = require('./feature-toggle-controller.js');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/feature-toggles',
      config: {
        auth: false,
        handler: featureToggleController.getActiveFeatures,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'feature-toggles-api';
