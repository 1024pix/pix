import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { invigilatorKitController } from './invigilator-kit-controller.js';
import { authorization } from './pre-handlers/authorization.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{sessionId}/invigilator-kit',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                authorization.checkUserHaveCertificationCenterMembershipForSession,
                authorization.checkUserHaveInvigilatorAccessForSession,
              ])(request, h),
            assign: 'authorizationCheck',
          },
        ],
        handler: invigilatorKitController.getInvigilatorKitPdf,
        tags: ['api', 'sessions', 'invigilator'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
            '- Cette route permet de télécharger le kit surveillant au format pdf',
        ],
      },
    },
  ]);
};

export const invigilatorKitRoute = { name: 'certification/session-management/invigilator-kit-api', register };
