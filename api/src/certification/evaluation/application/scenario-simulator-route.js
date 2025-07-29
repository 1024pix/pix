import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { getChallengeLocales } from '../../../shared/domain/services/locale-service.js';
import { ComplementaryCertificationKeys } from '../../shared/domain/models/ComplementaryCertificationKeys.js';
import { scenarioSimulatorController } from './scenario-simulator-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/scenario-simulator',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object()
            .keys({
              initialCapacity: Joi.number().integer().min(-8).max(8),
              numberOfIterations: Joi.number().integer().min(0),
              challengePickProbability: Joi.number().min(0).max(100),
              variationPercent: Joi.number().min(0).max(1),
              capacity: Joi.number().min(-8).max(8).required(),
              accessibilityAdjustmentNeeded: Joi.boolean(),
              locale: Joi.string()
                .valid(...getChallengeLocales())
                .lowercase()
                .required(),
              complementaryCertificationKey: Joi.string().valid(...Object.values(ComplementaryCertificationKeys)),
              stopAtChallenge: Joi.number().min(1).max(32).description('Limit the number of question in an iteration.'),
            })
            .required(),
        },
        handler: scenarioSimulatorController.simulateFlashAssessmentScenario,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle renvoie la liste de challenges passés avec le nouvel algorithme ainsi que le niveau estimé, pour une liste de réponses données',
        ],
      },
    },
  ]);
};

const name = 'scenario-simulator-api';
export { name, register };
