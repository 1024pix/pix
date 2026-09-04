import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { scriptExecutionController } from './script-execution.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/llm-assistant/run-script',
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
          payload: Joi.object({
            script: Joi.string().required(),
            sheets: Joi.array().required(),
          }),
        },
        payload: {
          parse: true,
          allow: 'application/json',
          output: 'data',
          maxBytes: 10 * 1024 * 1024,
        },
        handler: scriptExecutionController.runScript,
        tags: ['api', 'admin', 'llm-assistant', 'run-script'],
        notes: [
          '- **Restreint aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, SUPPORT ou METIER**',
          "- Exécute un script généré par le LLM côté serveur (vm.runInContext) avec un objet tools qui appelle le MCP en interne",
        ],
      },
    },
  ]);
};

const name = 'llm-assistant/script-execution-api';
export const scriptExecutionRoute = { name, register };
