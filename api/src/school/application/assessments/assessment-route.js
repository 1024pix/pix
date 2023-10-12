import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { assessmentController } from './assessment-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/assessments/{id}/next',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getNextChallengeForPix1d,
        notes: ["- Récupération de la question suivante pour l'évaluation de mission donnée"],
        tags: ['api'],
      },
    },
  ]);
};
const name = 'assessment-pix1d-api';
export { register, name };
