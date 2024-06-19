import { registrationOrganizationLearnerController } from './registration-organization-learner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organization-learners',
      config: {
        handler: registrationOrganizationLearnerController.findAssociation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération du prescrit\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ]);
};

const name = 'registration-organization-learner-api';

export { name, register };
