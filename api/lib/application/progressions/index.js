import { progressionController } from './progression-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/progressions/{id}',
      config: {
        handler: progressionController.get,
        tags: ['api'],
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Cette route renvoie une évaluation des acquis utilisateur basée sur un profil cible',
        ],
      },
    },
  ]);
};

const name = 'progressions-api';
export { register, name };
