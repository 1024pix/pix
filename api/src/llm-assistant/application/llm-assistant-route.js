import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { llmAssistantController } from './llm-assistant-controller.js';
import { checkLLMAssistantIsEnabled } from './pre-handlers/index.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/llm-assistant/conversations/messages',
      config: {
        pre: [
          { method: checkLLMAssistantIsEnabled },
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            messages: Joi.array()
              .items(
                Joi.object({
                  id: Joi.string(),
                  role: Joi.string().required(),
                  content: Joi.alternatives().try(Joi.string(), Joi.array()),
                  parts: Joi.array(),
                  metadata: Joi.object(),
                }),
              )
              .required(),
            id: Joi.string(),
            messageId: Joi.string(),
            trigger: Joi.string(),
            metadata: Joi.object(),
            tools: Joi.object(),
            documentContext: Joi.string(),
          }),
        },
        handler: llmAssistantController.createOrContinueConversation,
        tags: ['api', 'llm-assistant'],
        notes: [
          "- Cette route est restreinte aux membres de Pix Admin ayant le rôle super admin, et n'ouvre que si le feature toggle isLlmAssistantEnabled est actif",
          "- Elle ouvre un flux d'évènements portant la réponse de l'assistant à la fenêtre de conversation reçue",
        ],
      },
    },
  ]);
}

const name = 'llm-assistant/conversations-api';
export const llmAssistantRoute = { name, register };
