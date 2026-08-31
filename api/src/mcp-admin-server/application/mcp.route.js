import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { mcpController } from './mcp.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/mcp',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          parse: true,
          allow: 'application/json',
        },
        handler: mcpController.handle,
        tags: ['api', 'admin', 'mcp-admin-server', 'mcp'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, SUPPORT ou METIER**',
          "- Elle expose un endpoint MCP (Model Context Protocol) JSON-RPC pour l'assistant LLM",
        ],
      },
    },
  ]);
};

const name = 'mcp-admin-server/mcp-api';
export const mcpRoute = { name, register };
