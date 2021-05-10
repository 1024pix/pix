const tagController = require('./tag-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/tags',
      config: {
        handler: tagController.findAllOrganizationsTags,
        notes: [
          '- ** Cette route est accessible aux utilisateurs Pix authentifiés \n' +
          '- ** Récupère la liste de tout les tags.',
        ],
        tags: ['api', 'tags'],
      },
    },
  ]);
};

exports.name = 'tags-api';
