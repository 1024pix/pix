import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationController } from './certification-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/shared-certifications',
      config: {
        validate: {
          payload: Joi.object({
            verificationCode: Joi.string().min(10).max(10),
          }),
        },
        auth: false,
        handler: certificationController.getCertificationByVerificationCode,
        notes: [
          "- **Route accessible par n'importe qui**\n" +
            '- Récupération des informations d’une certification d’un utilisateur' +
            ' via un code de vérification',
        ],
        tags: ['api', 'certifications', 'shared-certifications'],
      },
    },
    {
      method: 'GET',
      path: '/api/certifications/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationController.getCertification,
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Seules les certifications de l’utilisateur authentifié sont accessibles\n' +
            '- Récupération des informations d’une certification de l’utilisateur courant',
        ],
        tags: ['api', 'certifications'],
      },
    },
    {
      method: 'GET',
      path: '/api/certifications',
      config: {
        handler: certificationController.findUserCertifications,
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Récupération de toutes les certifications complétées de l’utilisateur courant',
        ],
        tags: ['api', 'certifications'],
      },
    },
  ]);
};

const name = 'certification-api';
export { name, register };
