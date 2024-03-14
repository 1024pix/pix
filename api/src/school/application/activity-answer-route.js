import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { activityAnswerController } from './activity-answer-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/pix1d/activity-answers',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                value: Joi.string().allow(''),
                result: Joi.string().allow(null),
                'result-details': Joi.string().allow(null),
              },
              relationships: Joi.object({
                challenge: Joi.object({
                  data: Joi.object({
                    id: identifiersType.challengeId,
                    type: Joi.string(),
                  }),
                }).required(),
              }).required(),
              type: Joi.string(),
            },
            meta: Joi.object({
              assessmentId: identifiersType.assessmentId.optional(),
              isPreview: Joi.bool(),
            })
              .xor('assessmentId', 'isPreview')
              .required(),
          }),
        },
        handler: activityAnswerController.save,
        tags: ['api', 'pix1d', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Enregistre une réponse à un challenge pour Pix 1D',
        ],
      },
    },
  ]);
};

const name = 'activity-answers-api';
export { name, register };
