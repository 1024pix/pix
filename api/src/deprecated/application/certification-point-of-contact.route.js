import { certificationPointOfContactController } from './certification-point-of-contact.controller.js';

export const certificationPointOfContactRoute = [
  {
    method: 'GET',
    path: '/api/certification-point-of-contacts/me',
    config: {
      handler: (request, h) => certificationPointOfContactController.getCertificationPointOfContact(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**' +
          '\n' +
          '- Récupération d’un référent de certification.',
      ],
      tags: ['api', 'deprecated', 'certification-point-of-contact', 'certification'],
    },
  },
];
