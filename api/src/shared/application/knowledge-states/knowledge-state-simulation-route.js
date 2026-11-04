import Joi from 'joi';

import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { knowledgeStateSimulationController } from './knowledge-state-simulation-controller.js';

const knowledgeElementSchema = Joi.object({
  skillId: Joi.string().required(),
  competenceId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(KnowledgeElement.StatusType))
    .required(),
  source: Joi.string()
    .valid(...Object.values(KnowledgeElement.SourceType))
    .required(),
  earnedPix: Joi.number().required(),
  createdAt: Joi.date().required(),
})
  // The rows of the knowledge-elements table paste as they are: their other columns are dropped.
  .options({ stripUnknown: true });

const register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/knowledge-states/simulations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            data: Joi.object({
              knowledgeElements: Joi.array().items(knowledgeElementSchema).required(),
            }).required(),
          }),
        },
        handler: knowledgeStateSimulationController.simulate,
        tags: ['api', 'admin', 'knowledge-states'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs et aux membres métier**\n' +
            "Simule la migration des knowledge elements fournis vers les knowledge states et les scores par compétence, sans lire ni écrire de données d'utilisateur.",
        ],
      },
    },
  ]);
};

export const knowledgeStateSimulationRoute = { name: 'shared/knowledge-state-simulation-api', register };
