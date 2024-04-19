import { companionController } from './companion-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/companion/ping',
      config: {
        handler: companionController.savePing,
        tags: ['api', 'sessions', 'companion'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs connectés**\n' +
            '- Cette route permet d\'enregistrer un ping du "companion"',
        ],
      },
    },
  ]);
};

const name = 'companion-api';
export { name, register };
