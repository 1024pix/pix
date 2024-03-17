import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { scoringConfigurationController } from './scoring-configuration-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/competence-for-scoring-configuration',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.array()
            .items(
              Joi.object({
                competence: Joi.string(),
                values: Joi.array().items(
                  Joi.object({
                    bounds: Joi.object({
                      max: Joi.number(),
                      min: Joi.number(),
                    }),
                    competenceLevel: Joi.number(),
                  }),
                ),
              }),
            )
            .required(),
        },
        handler: scoringConfigurationController.saveCompetenceForScoringConfiguration,
        tags: ['api', 'scoring-configuration'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            "Création d'une nouvelle configuration de niveau par compétence pour la certification v3",
        ],
      },
    },
  ]);
  server.route([
    {
      method: 'POST',
      path: '/api/admin/certification-scoring-configuration',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.array()
            .items(
              Joi.object({
                meshLevel: Joi.number(),
                bounds: Joi.object({
                  min: Joi.number(),
                  max: Joi.number(),
                }),
              }),
            )
            .required(),
        },
        handler: scoringConfigurationController.saveCertificationScoringConfiguration,
        tags: ['api', 'admin', 'scoring-configuration'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            "Création d'une nouvelle configuration de score pour la certification v3",
        ],
      },
    },
  ]);
};

const name = 'scoring-configuration';

export { name, register };
