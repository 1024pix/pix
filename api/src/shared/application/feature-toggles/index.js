import { featureToggleController } from './feature-toggle-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/feature-toggles',
      options: {
        auth: false,
        handler: featureToggleController.getActiveFeatures,
        tags: ['api'],
        cache: false,
      },
    },
  ]);
};

export const featureTogglesRoute = { name: 'shared/feature-toggles-api', register };
