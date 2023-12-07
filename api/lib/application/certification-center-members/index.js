import { certificationCenterMemberController } from './certification-center-member-controller.js';
import { securityPreHandlers } from '../security-pre-handlers.js';

const register = async function (server) {
  const globalRoutes = [
    {
      method: 'GET',
      path: '/api/certification-center-members',
      config: {
        handler: certificationCenterMemberController.get,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Modification des informations d'un membre d'un centre de certification\n",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-center-members/{certificationCenterMemberId}',
      config: {
        handler: certificationCenterMemberController.update,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMemberId,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Modification des informations d'un membre d'un centre de certification\n",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ];

  server.route([...globalRoutes]);
};

const name = 'certification-center-members-api';
export { register, name };
