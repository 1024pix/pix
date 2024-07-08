import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { campaignResultsController } from './campaign-results-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{id}/assessment-results',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
          query: Joi.object({
            filter: Joi.object({
              divisions: Joi.array().items(Joi.string()),
              groups: Joi.array().items(Joi.string()),
              badges: [Joi.number().integer(), Joi.array().items(Joi.number().integer())],
              stages: [Joi.number().integer(), Joi.array().items(Joi.number().integer())],
              search: Joi.string().empty(''),
            }).default({}),
            page: {
              number: Joi.number().integer().empty(''),
              size: Joi.number().integer().empty(''),
            },
          }),
        },
        handler: campaignResultsController.findAssessmentParticipationResults,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des résultats d'une campagne d'évaluation",
        ],
        tags: ['api', 'campaign-results-assessment'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/profiles-collection-participations',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
          query: Joi.object({
            filter: Joi.object({
              divisions: Joi.array().items(Joi.string()),
              groups: Joi.array().items(Joi.string()),
              search: Joi.string().empty(''),
              certificability: Joi.string().empty(''),
            }).default({}),
            page: {
              number: Joi.number().integer().empty(''),
              size: Joi.number().integer().empty(''),
            },
          }),
        },
        handler: campaignResultsController.findProfilesCollectionParticipations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des profils collectés d'une campagne par son id",
        ],
        tags: ['api', 'campaign-results-profiles-collection'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/collective-results',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
        },
        handler: campaignResultsController.getCollectiveResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des résultats collectifs de la campagne par son id',
        ],
        tags: ['api', 'campaign'],
      },
    },
  ]);
};

const name = 'campaigns-participation-api';
export { name, register };
