import Joi from 'joi';
import { feedbackController } from './feedback-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
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
                content: Joi.string().max(10000).allow('').required(),
                category: Joi.string().allow(null).optional(),
                answer: Joi.string().allow(null).optional(),
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

const name = 'feedbacks-api';
export { register, name };
