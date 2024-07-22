import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { assessmentSupervisorAuthorization } from '../../shared/application/pre-handlers/session-supervisor-authorization.js';
import { certificationCandidateController } from './certification-candidate-controller.js';

const Joi = BaseJoi.extend(JoiDate);

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-candidates/{id}/authorize-to-start',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
          payload: Joi.object({
            'authorized-to-start': Joi.boolean().required(),
          }),
        },
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidateController.authorizeToStart,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Indiquer la présence d'un candidat pour permettre ou bloquer son entrée en session",
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
  ]);
};

const name = 'session-management-certification-candidate';
export { name, register };
