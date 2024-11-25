import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { scenarioSimulatorController } from './scenario-simulator-controller.js';

const _successRatesConfigurationValidator = Joi.object({
  startingChallengeIndex: Joi.number().integer().min(0).required(),
  endingChallengeIndex: Joi.number().integer().min(Joi.ref('startingChallengeIndex')).required(),
  value: Joi.number().min(0).max(1).required(),
});

const _baseScenarioParametersValidator = Joi.object().keys({
  initialCapacity: Joi.number().integer().min(-8).max(8),
  stopAtChallenge: Joi.number().integer().min(0),
  numberOfIterations: Joi.number().integer().min(0),
  challengePickProbability: Joi.number().min(0).max(100),
  challengesBetweenSameCompetence: Joi.number().min(0),
  limitToOneQuestionPerTube: Joi.boolean(),
  minimumEstimatedSuccessRateRanges: Joi.array().items(_successRatesConfigurationValidator),
  doubleMeasuresUntil: Joi.number().min(0),
  variationPercent: Joi.number().min(0).max(1),
  variationPercentUntil: Joi.number().min(0),
});

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
          payload: _baseScenarioParametersValidator
            .keys({
              capacity: Joi.number().min(-8).max(8).required(),
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
