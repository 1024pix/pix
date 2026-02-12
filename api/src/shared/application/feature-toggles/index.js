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
        cache: {
          otherwise: 'public, max-age=0, s-maxage=86400, must-revalidate',
        },
      },
    },
  ]);
};

const name = 'feature-toggles-api';
export { name, register };
