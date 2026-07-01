import Joi from 'joi';

import { PayloadTooLargeError, sendJsonApiError } from '../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../shared/constants.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { questController } from './quest-controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations/{campaignParticipationId}/quest-results',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkCampaignParticipationBelongsToUser,
          },
        ],
        handler: questController.getQuestResults,
        validate: {
          params: Joi.object({
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        notes: [
          '- **Route nécessitant une authentification**\n' +
            "- Récupère le résultat d'une quête pour une participation et un user donné",
        ],
        tags: ['api', 'quest'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/quests/template',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => questController.getTemplateForCreateOrUpdateQuestsInBatch(request, h),
        tags: ['api', 'admin', 'quests'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de télécharger le template pour créer ou mettre à jour des quêtes',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/quests',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          output: 'file',
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: (request, h) => questController.createOrUpdateQuestsInBatch(request, h),
        tags: ['api', 'admin', 'quests'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de créer ou mettre à jour des quêtes',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/check-user-quest',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'user-id': identifiersType.userId,
                'quest-id': identifiersType.questId,
              },
            },
          }),
        },
        handler: questController.checkUserQuest,
        tags: ['api', 'admin', 'quests'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle permet de vérifier si un utilisateur valide une quête',
        ],
      },
    },
  ]);
};
export const questRoute = { name: 'quest/quest-api', register };
