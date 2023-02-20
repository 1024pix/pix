import ProgressionController from './progression-controller';

export const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/progressions/{id}',
      config: {
        handler: ProgressionController.get,
        tags: ['api'],
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Cette route renvoie une évaluation des acquis utilisateur basée sur un profil cible',
        ],
      },
    },
  ]);
};

export const name = 'progressions-api';
