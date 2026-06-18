import Joi from 'joi';

import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { jwtApplicationAuthenticationStrategyName } from '../../shared/infrastructure/authentication-strategy-names.js';
import { llmPreviewController } from './llm-preview-controller.js';
import { checkLLMChatIsEnabled } from './pre-handlers/index.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/llm/preview/chats',
      config: {
        auth: {
          strategy: jwtApplicationAuthenticationStrategyName,
          access: { scope: 'llm-preview' },
        },
        pre: [{ method: checkLLMChatIsEnabled }],
        validate: {
          payload: Joi.object({
            configuration: Joi.object({
              challenge: Joi.object({
                inputMaxChars: Joi.number().required(),
                inputMaxPrompts: Joi.number().required(),
              })
                .required()
                .unknown(true),
              attachment: Joi.object({
                name: Joi.string().optional(),
                context: Joi.string().optional(),
              })
                .optional()
                .unknown(true),
              preview: Joi.object({
                moderationPrompt: Joi.string().min(1).optional(),
                validationPrompt: Joi.string().min(1).optional(),
              })
                .optional()
                .unknown(true),
            })
              .required()
              .unknown(true),
          }).required(),
        },
        handler: llmPreviewController.startChat,
        tags: ['api', 'llm', 'preview'],
        notes: [
          'Cette route est restreinte aux applications avec le scope llm-preview',
          'Elle permet de créer une discussion LLM de preview avec la configuration en payload',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/llm/preview/embed/llm/chats/{chatId}',
      config: {
        auth: false,
        pre: [{ method: checkLLMChatIsEnabled }],
        validate: {
          params: Joi.object({
            chatId: identifiersType.chatId,
          }).required(),
        },
        handler: llmPreviewController.getChat,
        tags: ['api', 'llm', 'preview'],
        notes: ['Cette route est publique', 'Elle permet de récupérer l’état d’une discussion LLM de preview'],
      },
    },
    {
      method: 'POST',
      path: '/api/llm/preview/embed/llm/chats/{chatId}/messages',
      config: {
        auth: false,
        pre: [{ method: checkLLMChatIsEnabled }],
        validate: {
          params: Joi.object({
            chatId: identifiersType.chatId,
          }).required(),
          payload: Joi.object({
            prompt: Joi.string().optional().allow('', null),
            attachmentName: Joi.string().optional().allow('', null),
          }).required(),
        },
        handler: llmPreviewController.promptChat,
        tags: ['api', 'llm', 'preview', 'prompt'],
        notes: ['Cette route est publique', 'Elle permet de prompt le LLM dans une discussion de preview'],
      },
    },
  ]);
}

const name = 'llm/llm-preview-api';
export const llmPreviewRoute = { name, register };
