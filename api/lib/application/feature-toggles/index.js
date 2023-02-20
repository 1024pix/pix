import featureToggleController from './feature-toggle-controller';

export const register = async (server) => {
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

export const name = 'feature-toggles-api';
