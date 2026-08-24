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
  {
    method: 'GET',
    path: '/api/users/my-account',
    config: {
      handler: (request, h) => usersMeController.getCurrentUserAccountInfo(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des informations du compte utilisateur authentifié\n',
      ],
      tags: ['api', 'deprecated', 'user', 'my-account'],
    },
  },
];
