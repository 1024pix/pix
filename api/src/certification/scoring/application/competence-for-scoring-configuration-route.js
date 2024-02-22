import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { competenceForScoringConfigurationController } from './competence-for-scoring-configuration-controller.js';
import Joi from 'joi';

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
        handler: competenceForScoringConfigurationController.saveCompetenceForScoringConfiguration,
        tags: ['api', 'competence-for-scoring-configuration'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            "Création d'une nouvelle configuration de niveau par compétence pour la certification v3",
        ],
      },
    },
  ]);
};

const name = 'competence-for-scoring-configuration';

export { register, name };
