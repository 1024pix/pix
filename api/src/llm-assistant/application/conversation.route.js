import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { conversationController } from './conversation.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/llm-assistant/conversations/messages',
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
            // Champs envoyés par AssistantChatTransport (@assistant-ui/react-ai-sdk)
            id: Joi.string().optional(),
            messageId: Joi.string().optional(),
            trigger: Joi.string().optional(),
            tools: Joi.object().optional(),
            metadata: Joi.object().optional(),
            documentContext: Joi.string().optional(),
            messages: Joi.array()
              .items(
                Joi.object({
                  id: Joi.string().optional(),
                  role: Joi.string().required(),
                  // Les messages ModelMessage ont `content`, les UIMessage ont `parts`
                  content: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
                  parts: Joi.array().optional(),
                  metadata: Joi.object().optional(),
                }).unknown(true),
              )
              .required(),
          }).required(),
        },
        handler: conversationController.postMessage,
        tags: ['api', 'admin', 'llm-assistant', 'conversation'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, SUPPORT ou METIER**',
          "- Elle permet d'envoyer un message à l'assistant LLM et de recevoir une réponse en streaming SSE",
        ],
      },
    },
  ]);
};

const name = 'llm-assistant/conversation-api';
export const conversationRoute = { name, register };
