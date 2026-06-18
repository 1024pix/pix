import Joi from 'joi';

import { checkLLMChatIsEnabled } from '../../../llm/application/pre-handlers/index.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { passageController } from './passage-controller.js';

const ARBITRARY_MIN_TIMESTAMP = new Date('2025-04-30').getTime();

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/passages',
      config: {
        auth: false,
        handler: handlerWithDependencies(passageController.create),
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'module-id': Joi.string().required(),
                'module-version': Joi.string().length(64).required(),
                'sequence-number': Joi.number().valid(1).required(),
                'occurred-at': Joi.number().min(ARBITRARY_MIN_TIMESTAMP).required(),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        notes: ['- Permet de créer un passage pour un module'],
        tags: ['api', 'passages', 'modules'],
      },
    },
    {
      method: 'POST',
      path: '/api/passages/{passageId}/answers',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            passageId: identifiersType.passageId.required(),
          }).required(),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'element-id': Joi.string().guid({ version: 'uuidv4' }).required(),
                'user-response': Joi.array().required(),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: handlerWithDependencies(passageController.verifyAndSaveAnswer),
        notes: ["- Permet de vérifier la réponse d'un élément et de la stocker"],
        tags: ['api', 'passages', 'element', 'réponse'],
      },
    },
    {
      method: 'POST',
      path: '/api/passages/{passageId}/terminate',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            passageId: identifiersType.passageId.required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: handlerWithDependencies(passageController.terminate),
        notes: ['- Permet de marquer un passage comme terminé'],
        tags: ['api', 'passages'],
      },
    },
    {
      method: 'POST',
      path: '/api/passages/{passageId}/embed/llm/chats',
      config: {
        pre: [
          {
            method: checkLLMChatIsEnabled,
          },
        ],
        validate: {
          params: Joi.object({
            passageId: identifiersType.passageId.required(),
          }).required(),
          payload: Joi.object({
            configId: Joi.string().required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: handlerWithDependencies(passageController.startEmbedLlmChat),
        tags: ['api', 'passages', 'embed', 'llm'],
        notes: [
          "Cette route permet de démarrer une conversation avec un LLM dans le cadre de la réalisation d'un embed LLM dans un modulix",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/passages/{passageId}/embed/llm/chats/{chatId}/messages',
      config: {
        pre: [
          {
            method: checkLLMChatIsEnabled,
          },
        ],
        validate: {
          params: Joi.object({
            passageId: identifiersType.passageId.required(),
            chatId: identifiersType.chatId,
          }).required(),
          payload: Joi.object({
            prompt: Joi.string().optional().allow('', null),
            attachmentName: Joi.string().optional().allow('', null),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: handlerWithDependencies(passageController.promptToLLMChat),
        tags: ['api', 'passages', 'embed', 'llm', 'prompt'],
        notes: [
          "Cette route permet de prompt le LLM dans une conversation existante dans le cadre de la réalisation d'un embed LLM dans un modulix",
        ],
      },
    },
  ]);
};

export const passageRoute = { name: 'devcomp/passages-api', register };
