import healthcheckController from './healthcheck-controller';

export const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api',
      config: {
        auth: false,
        handler: healthcheckController.get,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/db',
      config: {
        auth: false,
        handler: healthcheckController.checkDbStatus,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/redis',
      config: {
        auth: false,
        handler: healthcheckController.checkRedisStatus,
        tags: ['api'],
      },
    },
  ]);
};

export const name = 'healthcheck-api';
