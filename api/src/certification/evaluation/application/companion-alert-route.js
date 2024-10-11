import Joi from 'joi';

import { assessmentAuthorization } from '../../../evaluation/application/pre-handlers/assessment-authorization.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { companionAlertController } from './companion-alert-controller.js';

const register = async function (server) {
  const routes = [
    {
      method: 'POST',
      path: '/api/assessments/{assessmentId}/companion-alert',
      config: {
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            assessmentId: identifiersType.assessmentId,
          }),
        },
        handler: companionAlertController.createCertificationCompanionLiveAlert,
        tags: ['api', 'companion-alert'],
      },
    },
  ];
  server.route(routes);
};

const name = 'companion-alert-api';
export { name, register };
