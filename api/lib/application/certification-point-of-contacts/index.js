const certificationPointOfContactController = require('./certification-point-of-contact-controller.js');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certification-point-of-contacts/me',
      config: {
        handler: certificationPointOfContactController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés*' * '\n' +
            '- Récupération d’un référent de certification.',
        ],
        tags: ['api', 'user', 'certification', 'certification-point-of-contact'],
      },
    },
  ]);
};

exports.name = 'certification-point-of-contacts-api';
