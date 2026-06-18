import Joi from 'joi';

import { assessmentAuthorization } from '../../../evaluation/application/pre-handlers/assessment-authorization.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';
import { assessmentController } from './assessment-controller.js';

const register = async function (server) {
  const routes = [
    {
      method: 'GET',
      path: '/api/assessments/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        handler: assessmentController.getAssessmentWithNextChallenge,
        tags: ['api'],
      },
    },
  ];

  server.route(routes);
};

export const assessmentsRoute = { name: 'shared/assessments-api', register };
