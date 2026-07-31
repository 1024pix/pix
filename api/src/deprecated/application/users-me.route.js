import { usersMeController } from './users-me.controller.js';

export const usersMeRoute = [
  {
    method: 'GET',
    path: '/api/users/me',
    config: {
      handler: (request, h) => usersMeController.getCurrentUser(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l’utilisateur courant\n',
      ],
      tags: ['api', 'deprecated', 'users-me'],
    },
  },
];
