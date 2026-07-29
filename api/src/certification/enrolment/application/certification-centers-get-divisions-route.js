import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { securityPreHandlers as certifSecurityPrehandlers } from '../../shared/application/security-pre-handlers.js';
import { certificationCenterController } from './certification-center-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/divisions',
      config: {
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        pre: [
          {
            method: certifSecurityPrehandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
        ],
        handler: certificationCenterController.getDivisions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération d'une liste de classes à partir d'un identifiant de centre de certification",
        ],
        tags: ['api', 'certification-center', 'students', 'session'],
      },
    },
  ]);
};

export const certificationCentersGetDivisionsRoute = {
  name: 'certification/enrolment/certification-centers-get-divisions-api',
  register,
};
