import Joi from 'joi';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { scenarioSimulatorController } from './scenario-simulator-controller.js';

const _successRatesConfigurationValidator = Joi.alternatives(
  Joi.object({
    type: Joi.string().valid('fixed').required(),
    startingChallengeIndex: Joi.number().integer().min(0).required(),
    endingChallengeIndex: Joi.number().integer().min(Joi.ref('startingChallengeIndex')).required(),
    value: Joi.number().min(0).max(1).required(),
  }),
  Joi.object({
    type: Joi.string().valid('linear').required(),
    startingChallengeIndex: Joi.number().integer().min(0).required(),
    endingChallengeIndex: Joi.number().integer().min(Joi.ref('startingChallengeIndex')).required(),
    startingValue: Joi.number().min(0).max(1).required(),
    endingValue: Joi.number().min(0).max(1).required(),
  }),
);

const _baseScenarioParametersValidator = Joi.object().keys({
  initialCapacity: Joi.number().integer().min(-8).max(8),
  stopAtChallenge: Joi.number().integer().min(0),
  numberOfIterations: Joi.number().integer().min(0),
  warmpUpLength: Joi.number().integer().min(0),
  forcedCompetencies: Joi.array().items(Joi.string()),
  useObsoleteChallenges: Joi.boolean(),
  challengePickProbability: Joi.number().min(0).max(100),
  challengesBetweenSameCompetence: Joi.number().min(0),
  limitToOneQuestionPerTube: Joi.boolean(),
  minimumEstimatedSuccessRateRanges: Joi.array().items(_successRatesConfigurationValidator),
  enablePassageByAllCompetences: Joi.boolean(),
  variationPercent: Joi.number().min(0).max(1),
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
          payload: Joi.alternatives([
            _baseScenarioParametersValidator.keys({
              type: Joi.string().valid('deterministic').required(),
              answerStatusArray: Joi.array()
                .items(Joi.string().allow('ok', 'ko', 'aband'))
                .required(),
            }),
            _baseScenarioParametersValidator.keys({
              type: Joi.string().valid('random').required(),
              probabilities: Joi.object({
                ok: Joi.number(),
                ko: Joi.number(),
                aband: Joi.number(),
              }),
              length: Joi.number().integer().min(0).required(),
            }),
            _baseScenarioParametersValidator.keys({
              type: Joi.string().valid('capacity').required(),
              capacity: Joi.number().min(-8).max(8).required(),
            }),
          ]).required(),
        },
        handler: scenarioSimulatorController.simulateFlashAssessmentScenario,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle renvoie la liste de challenges passés avec le nouvel algorithme ainsi que le niveau estimé, pour une liste de réponses données',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/scenario-simulator/csv-import',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: scenarioSimulatorController.importScenarios,
        payload: {
          maxBytes: 20715200,
          output: 'file',
          parse: 'gunzip',
        },
        tags: ['api'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de générer la liste de challenges passés avec le nouvel algorithme ainsi que le niveau estimé, pour une liste de réponses données via un import de fichier CSV',
        ],
      },
    },
  ]);
};

const name = 'scenario-simulator-api';
export { register, name };
