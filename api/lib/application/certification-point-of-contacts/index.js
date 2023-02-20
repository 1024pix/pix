import certificationPointOfContactController from './certification-point-of-contact-controller';

export const register = async function (server) {
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

export const name = 'certification-point-of-contacts-api';
