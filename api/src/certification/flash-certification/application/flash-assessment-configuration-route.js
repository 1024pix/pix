import { flashAssessmentConfigurationController } from './flash-assessment-configuration-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import Joi from 'joi';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/flash-assessment-configuration',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: flashAssessmentConfigurationController.getActiveFlashAssessmentConfiguration,
        tags: ['api', 'flash-assessment-configuration'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            'Récupère la configuration active pour la certification v3',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/flash-assessment-configuration',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            warmUpLength: Joi.number().integer().min(0).optional(),
            forcedCompetences: Joi.array().items(Joi.string()).optional(),
            maximumAssessmentLength: Joi.number().integer().min(0).allow(null).optional(),
            challengesBetweenSameCompetence: Joi.number().integer().min(0).allow(null).optional(),
            limitToOneQuestionPerTube: Joi.boolean().optional(),
            enablePassageByAllCompetences: Joi.boolean().optional(),
            doubleMeasuresUntil: Joi.number().allow(null).optional(),
            variationPercent: Joi.number().min(0).max(1).allow(null).optional(),
            variationPercentUntil: Joi.number().allow(null).optional(),
          }),
        },
        handler: flashAssessmentConfigurationController.updateActiveFlashAssessmentConfiguration,
        tags: ['api', 'flash-assessment-configuration'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            'Met à jour la configuration active pour la certification v3',
        ],
      },
    },
  ]);
};

const name = 'flash-assessment-configuration';

export { register, name };
