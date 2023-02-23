const feedbackController = require('./feedback-controller.js');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type.js');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/feedbacks',
      config: {
        auth: false,
        handler: feedbackController.save,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('feedbacks'),
              attributes: Joi.object({
                content: Joi.string().min(1).required(),
              }),
              relationships: Joi.object({
                assessment: Joi.object({
                  data: Joi.object({
                    type: Joi.string().valid('assessments').required(),
                    id: identifiersType.assessmentId,
                  }),
                }),
                challenge: Joi.object({
                  data: Joi.object({
                    type: Joi.string().valid('challenges').required(),
                    id: identifiersType.challengeId,
                  }),
                }),
              }),
            }),
          }),
          headers: Joi.object({
            'user-agent': Joi.string().optional(),
          }),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'feedbacks-api';
