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
          expiresIn: 30 * 1000,
        },
      },
    },
    // TODO: Test route to be removed soon
    {
      method: 'GET',
      path: '/api/test-origin-soon-to-be-remove',
      config: {
        auth: false,
        handler: featureToggleController.getForwardedOrigin,
        notes: [
          '- **Route ponctuelle à des fins de test**\n' +
            '- **Cette route est publique**\n' +
            '- Récupération de l’origin HTTP de l’application appelante\n',
        ],
        tags: ['identity-access-management', 'api', 'user'],
      },
    },
  ]);
};

const name = 'feature-toggles-api';
export { name, register };
