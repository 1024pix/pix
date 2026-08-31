import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { toolExecutionController } from './tool-execution.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/llm-assistant/tools',
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
        handler: toolExecutionController.listTools,
        tags: ['api', 'admin', 'llm-assistant', 'tools'],
        notes: [
          '- **Restreint aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, SUPPORT ou METIER**',
          "- Retourne la liste des outils MCP disponibles avec leurs annotations",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/llm-assistant/tools/{toolName}',
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
        validate: {
          params: Joi.object({
            // Le nom de l'outil doit commencer par une lettre minuscule,
            // suivi de lettres minuscules, chiffres ou underscores (1 à 64 caractères au total)
            toolName: Joi.string()
              .pattern(/^[a-z][a-z0-9_]{0,63}$/)
              .required(),
          }),
          payload: Joi.object().unknown(true),
        },
        payload: {
          parse: true,
          allow: 'application/json',
          output: 'data',
        },
        handler: toolExecutionController.relayTool,
        tags: ['api', 'admin', 'llm-assistant', 'tools'],
        notes: [
          '- **Restreint aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, SUPPORT ou METIER**',
          "- Relais générique vers le serveur MCP : transmet les arguments tels quels à l'outil désigné par {toolName}",
        ],
      },
    },
  ]);
};

const name = 'llm-assistant/tool-execution-api';
export const toolExecutionRoute = { name, register };
