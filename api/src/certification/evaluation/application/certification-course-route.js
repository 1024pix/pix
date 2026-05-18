import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { V3_CERTIFICATION_AVAILABLE_LOCALES } from '../../shared/domain/models/CertificationCourse.js';
import { certificationCourseController } from './certification-course-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-courses',
      config: {
        handler: certificationCourseController.save,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'access-code': Joi.string().required(),
                'session-id': identifiersType.sessionId,
                locale: Joi.string()
                  .valid(...V3_CERTIFICATION_AVAILABLE_LOCALES)
                  .optional()
                  .allow(null),
              },
            },
          }),
          headers: Joi.object({
            'x-timezone': Joi.string().optional(),
          }),
          options: {
            allowUnknown: true,
          },
        },
        notes: [
          '- **Route nécessitant une authentification**\n' +
            "- S'il existe déjà une certification pour l'utilisateur courant dans cette session, alors cette route renvoie la certification existante avec un code 200\n" +
            "- Sinon, crée une certification pour l'utilisateur courant dans la session indiquée par l'attribut *access-code*, et la renvoie avec un code 201\n",
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-courses/{certificationCourseId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserOwnsCertificationCourse,
            assign: 'hasAuthorizationToAccessOwnCertificationCourse',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCourseId: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationCourseController.get,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'certification/evaluation/certification-courses-api';
export { name, register };
