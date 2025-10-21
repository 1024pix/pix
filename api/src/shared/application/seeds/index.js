import seedsController from './seeds-controller.js';

const register = async function (server) {
  const routes = [
    {
      method: 'GET',
      path: '/api/seeds',
      config: {
        auth: false,
        handler: seedsController.get,
        tags: ['api'],
      },
    }]

  server.route(routes);
};

const name = 'seeds-api';
export { name, register };
