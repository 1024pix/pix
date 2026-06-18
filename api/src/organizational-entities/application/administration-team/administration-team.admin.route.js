import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { administrationTeamsController } from './administration-team.admin.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/administration-teams',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => administrationTeamsController.findAllAdministrationTeams(request, h),
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Renvoie toutes les administration teams.',
        ],
        tags: ['api', 'administration-teams'],
      },
    },
  ]);
};

export const administrationTeamAdminRoute = { name: 'organizational-entities/administration-team-admin-api', register };
