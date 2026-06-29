import { featureToggles } from '../../infrastructure/feature-toggles/index.js';
import { healthcheckController } from './healthcheck-controller.js';

const register = async function (server) {
  const routes = [
    {
      method: 'GET',
      path: '/api',
      config: {
        auth: false,
        handler: healthcheckController.get,
        tags: ['api', 'healthcheck'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/db',
      config: {
        auth: false,
        handler: healthcheckController.checkDbStatus,
        tags: ['api', 'healthcheck'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/redis',
      config: {
        auth: false,
        handler: healthcheckController.checkRedisStatus,
        tags: ['api', 'healthcheck'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/forwarded-origin',
      config: {
        auth: false,
        handler: healthcheckController.checkForwardedOriginStatus,
        notes: ['- **Cette route est publique**\n' + "- Récupération de l'origine HTTP de l'application appelante\n"],
        tags: ['api', 'healthcheck'],
      },
    },
  ];

  if (await featureToggles.get('isOsHealthcheckEnabled')) {
    routes.push({
      method: 'GET',
      path: '/api/healthcheck/os',
      config: {
        auth: false,
        handler: healthcheckController.checkOsStatus,
        tags: ['api', 'healthcheck'],
      },
    });
  }

  server.route(routes);
};

export const healthcheckRoute = { name: 'shared/healthcheck-api', register };
