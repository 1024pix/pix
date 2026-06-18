import Joi from 'joi';

import { checkLLMChatIsEnabled } from '../../../llm/application/pre-handlers/index.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { config } from '../../../shared/config.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { assessmentAuthorization } from '../pre-handlers/assessment-authorization.js';
import { assessmentController } from './assessment-controller.js';

const { featureToggles } = config;

const register = async function (server) {
  const routes = [
    {
      method: 'PATCH',
      path: '/api/assessments/{id}/complete-assessment',
      config: {
        auth: false,
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.completeAssessment,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/assessments/{assessmentId}/embed/llm/chats',
      config: {
        pre: [
          {
            method: checkLLMChatIsEnabled,
          },
        ],
        validate: {
          params: Joi.object({
            assessmentId: identifiersType.assessmentId.required(),
          }).required(),
          payload: Joi.object({
            configId: Joi.string().required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: assessmentController.startEmbedLlmChat,
        tags: ['api', 'assessments', 'embed', 'llm'],
        notes: [
          "Cette route permet de démarrer une conversation avec un LLM dans le cadre de la réalisation d'un embed LLM lors d'une évaluation",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/assessments/{assessmentId}/embed/llm/chats/{chatId}/messages',
      config: {
        pre: [
          {
            method: checkLLMChatIsEnabled,
          },
        ],
        validate: {
          params: Joi.object({
            assessmentId: identifiersType.assessmentId.required(),
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
        handler: assessmentController.promptToLLMChat,
        tags: ['api', 'assessments', 'embed', 'llm', 'prompt'],
        notes: [
          "Cette route permet de prompt le LLM dans une conversation existante dans le cadre de la réalisation d'un embed LLM lors d'une évaluation",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/assessments',
      config: {
        auth: false,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                type: Joi.string().required(),
              }).required(),
            }).required(),
          }).required(),
        },
        handler: assessmentController.save,
        tags: ['api'],
      },
    },

    {
      method: 'PATCH',
      path: '/api/assessments/{id}/last-challenge-state/{state}',
      config: {
        auth: false,
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
            state: Joi.string().valid('asked', 'timeout', 'focusedout'),
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'challenge-id': Joi.string().allow(null),
              }),
            }),
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: assessmentController.updateLastChallengeState,
        notes: [
          '- Sauvegarde la dernière question posée, ainsi que son état\n' +
            "- L'état doit être indiqué en paramètre, et la question optionnellement dans le payload.",
        ],
        tags: ['api', 'assessments'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/competence-evaluations',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.findCompetenceEvaluations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des competence-evaluations d'un assessment",
        ],
        tags: ['api', 'competence-evaluations'],
      },
    },
  ];

  if (featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled) {
    routes.push({
      method: 'POST',
      path: '/api/admin/assessments/{id}/always-ok-validate-next-challenge',
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
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.autoValidateNextChallenge,
        tags: ['api'],
      },
    });
  }
  server.route(routes);
};

export const assessmentsRoute = { name: 'evaluation/evaluation-assessments-api', register };
