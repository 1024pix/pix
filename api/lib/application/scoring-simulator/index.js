const Joi = require('joi');
const securityPreHandlers = require('../security-pre-handlers.js');
const scoringSimulatorController = require('./scoring-simulator-controller.js');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/scoring-simulator/old',
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
          payload: Joi.object({
            dataset: Joi.object({
              id: Joi.string(),
              simulations: Joi.array()
                .required()
                .items(
                  Joi.object({
                    id: Joi.string(),
                    answers: Joi.array()
                      .required()
                      .items(
                        Joi.object({
                          challengeId: Joi.string().required(),
                          result: Joi.string().required(),
                        })
                      )
                      .min(1),
                  }).required()
                )
                .min(1),
            }).required(),
          }).required(),
        },
        handler: scoringSimulatorController.calculateOldScores,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle renvoie le score Pix calculé avec l'ancien algorithme pour une liste de questions et réponses données",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/scoring-simulator/flash',
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
          payload: Joi.object({
            context: Joi.object({
              id: Joi.string(),
              successProbabilityThreshold: Joi.number(),
              calculateEstimatedLevel: Joi.boolean(),
            }),
            dataset: Joi.object({
              id: Joi.string(),
              simulations: Joi.array()
                .required()
                .items(
                  Joi.object({
                    id: Joi.string(),
                    user: Joi.object({
                      id: Joi.string(),
                      estimatedLevel: Joi.number(),
                    }),
                    answers: Joi.array()
                      .items(
                        Joi.object({
                          challengeId: Joi.string().required(),
                          result: Joi.string().required(),
                        })
                      )
                      .min(1),
                  }).required()
                )
                .min(1),
            }).required(),
          }).required(),
        },
        handler: scoringSimulatorController.calculateFlashScores,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle renvoie le score Pix calculé avec l'algorithme Flash pour une liste de questions et réponses données",
        ],
      },
    },
  ]);
};

exports.name = 'scoring-simulator-api';
