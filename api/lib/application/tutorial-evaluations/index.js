const Joi = require('joi');

const tutorialEvaluationsController = require('./tutorial-evaluations-controller.js');
const identifiersType = require('../../domain/types/identifiers-type.js');

exports.register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/tutorials/{tutorialId}/evaluate',
      config: {
        handler: tutorialEvaluationsController.evaluate,
        validate: {
          params: Joi.object({
            tutorialId: identifiersType.tutorialId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                status: Joi.string().valid('LIKED', 'NEUTRAL').allow(null),
              }),
              type: Joi.string().valid('tutorial-evaluations'),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Appréciation d‘un tutoriel par l‘utilisateur courant\n' +
            '- L’id du tutoriel doit faire référence à un tutoriel existant',
        ],
      },
    },
  ]);
};

exports.name = 'tutorial-evaluations-api';
