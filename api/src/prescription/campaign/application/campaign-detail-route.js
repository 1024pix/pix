import Joi from 'joi';
import { campaignDetailController } from './campaign-detail-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

import { CampaignParticipationStatuses } from '../../shared/domain/constants.js';

const campaignParticipationStatuses = Object.values(CampaignParticipationStatuses);

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
        },
        handler: campaignDetailController.getById,
        notes: ["- Récupération d'une campagne par son id"],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/campaigns',
      config: {
        pre: [{ method: securityPreHandlers.checkUserBelongsToOrganization }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: campaignDetailController.findPaginatedFilteredCampaigns,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les campagnes rattachées à l’organisation.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csv-profiles-collection-results',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
        },
        handler: campaignDetailController.getCsvProfilesCollectionResults,
        notes: [
          "- **Cette route est restreinte via un token dédié passé en paramètre avec l'id de l'utilisateur.**\n" +
            "- Récupération d'un CSV avec les résultats de la campagne de collecte de profils\n" +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csv-assessment-results',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
        },
        handler: campaignDetailController.getCsvAssessmentResults,
        notes: [
          "- **Cette route est restreinte via un token dédié passé en paramètre avec l'id de l'utilisateur.**\n" +
            "- Récupération d'un CSV avec les résultats de la campagne d‘évaluation\n" +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/participants-activity',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
          query: Joi.object({
            'page[number]': Joi.number().integer().empty(''),
            'page[size]': Joi.number().integer().empty(''),
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[status]': Joi.string()
              .valid(...campaignParticipationStatuses)
              .empty(''),
            'filter[groups][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[search]': Joi.string().empty(''),
          }),
        },
        handler: campaignDetailController.findParticipantsActivity,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des participations d'une campagne par son id",
        ],
        tags: ['api', 'campaign'],
      },
    },
  ]);
};

const name = 'campaigns-detail-api';
export { register, name };
