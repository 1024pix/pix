const answerController = require('./answer-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.save,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible aux utilisateurs pour qui l\'answer appartient à leur assessment**\n' +
          '- Enregistre une réponse à un challenge',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        handler: answerController.get,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible aux utilisateurs pour qui l\'answer appartient à leur assessment**\n' +
          '- Récupère la réponse',
        ]
      }
    },
    {
      method: 'PATCH',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        handler: answerController.update,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible aux utilisateurs pour qui l\'answer appartient à leur assessment**\n' +
          '- Cette route ne fait rien actuellement',
        ],
      }
    },
    {
      method: 'GET',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.find,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible aux utilisateurs pour qui l\'answer appartient à leur assessment**\n' +
          '- Récupère la réponse correspondant à un challenge pour un assessment, ou null sinon',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/answers/{id}/correction',
      config: {
        auth: false,
        handler: answerController.getCorrection,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible aux utilisateurs pour qui l\'answer appartient à leur assessment**\n' +
          '- Récupère la correction à une réponse',
        ]
      }
    },
  ]);
};

exports.name = 'answers-api';
