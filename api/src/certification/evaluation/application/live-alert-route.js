import Joi from 'joi';

import { assessmentAuthorization } from '../../../evaluation/application/pre-handlers/assessment-authorization.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { liveAlertController } from './live-alert-controller.js';

const register = async function (server) {
  const routes = [
    {
      method: 'POST',
      path: '/api/assessments/{id}/alert',
      config: {
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'challenge-id': Joi.string().allow(null),
              }),
            }),
          }),
        },
        handler: liveAlertController.create,
        tags: ['api'],
      },
    },
  ];
  server.route(routes);
};

export const liveAlertRoute = { name: 'certification/evaluation/evaluation-live-alert-api', register };
