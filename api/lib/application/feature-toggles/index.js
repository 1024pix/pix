import { featureToggleController } from './feature-toggle-controller.js';

const register = async function (server) {
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

const name = 'feature-toggles-api';
export { name, register };
