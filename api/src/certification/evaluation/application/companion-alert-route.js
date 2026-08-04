import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { companionAlertController } from './companion-alert-controller.js';
import { evaluationSecurityPreHandlers } from './security-pre-handlers.js';

const register = async function (server) {
  const routes = [
    {
      method: 'POST',
      path: '/api/assessments/{assessmentId}/companion-alert',
      config: {
        pre: [
          {
            method: evaluationSecurityPreHandlers.checkUserOwnsAssessment,
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

export const companionAlertRoute = { name: 'certification/evaluation/evaluation-companion-alert-api', register };
