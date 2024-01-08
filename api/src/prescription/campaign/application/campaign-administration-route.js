import Joi from 'joi';
import { campaignAdministrationController } from './campaign-adminstration-controller.js';
import { sendJsonApiError, PayloadTooLargeError } from '../../../../lib/application/http-errors.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
const TWENTY_MEGABYTES = 1048576 * 20;

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/campaigns',
      config: {
        handler: campaignAdministrationController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Création d‘une nouvelle campagne\n' +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'orga', 'campaign'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaigns/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAuthorizationToManageCampaign,
            assign: 'isAdminOrCreatorFromTheCampaign',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
          payload: Joi.object({
            data: {
              type: 'campaigns',
              attributes: {
                'owner-id': identifiersType.ownerId,
                name: Joi.string().required(),
                title: Joi.string().allow(null).required(),
                'custom-landing-page-text': Joi.string().allow(null).required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: campaignAdministrationController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Modification d'une campagne\n" +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à modifier',
        ],
        tags: ['api', 'orga', 'campaign'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/campaigns',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        payload: {
          maxBytes: TWENTY_MEGABYTES,
          output: 'file',
          parse: 'gunzip',
          failAction: (_, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: campaignAdministrationController.createCampaigns,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            '- Elle permet de créer des campagnes à partir d‘un fichier au format CSV\n' +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'campaigns'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/campaigns/swap-codes',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          payload: Joi.object({
            firstCampaignId: identifiersType.campaignId,
            secondCampaignId: identifiersType.campaignId,
          }),
        },
        handler: campaignAdministrationController.swapCampaignCodes,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            '- Échanger les codes de deux campagnes\n' +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'campaigns'],
      },
    },
  ]);
};

const name = 'campaigns-administration-api';
export { register, name };
