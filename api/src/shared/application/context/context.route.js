import { contextController } from './context.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/context',
      options: {
        auth: false,
        handler: contextController.getContext,
        notes: ['Cette route renvoie le contexte, constitué de propriétés'],
        tags: ['shared', 'api', 'context'],
        cache: false,
      },
    },
  ]);
};

const name = 'context-api';
export { name, register };
