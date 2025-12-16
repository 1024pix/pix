import { configController } from './config.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/config',
      options: {
        auth: false,
        handler: configController.getConfig,
        notes: [
          'Cette route renvoie la configuration, constituée de propriétés, ' +
            'à disposition de tous les clients/applications sans authentification ,' +
            'fournissant des informations préalables à l’utilisation de l’API.',
        ],
        tags: ['shared', 'api', 'config'],
        cache: false,
      },
    },
  ]);
};

const name = 'config-api';
export { name, register };
