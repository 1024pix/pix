import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { certificationCenterInvitationController } from './certification-center-invitation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/certification-center-invitations/{certificationCenterInvitationId}',
      config: {
        handler: certificationCenterInvitationController.resendCertificationCenterInvitation,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId,
            assign: 'isAdminOfCertificationCenter',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterInvitationId: identifiersType.certificationCenterInvitationId.required(),
          }),
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n',
          "- Cette route permet de renvoyer une invitation en attente selon un **id d'invitation**",
        ],
        tags: ['api', 'certification-center-invitation'],
      },
    },
  ]);
};

const name = 'certification-center-invitations-api';
export { name, register };
