import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
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
      method: 'POST',
      path: '/api/admin/certification/neutralize-challenge',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                certificationCourseId: identifiersType.certificationCourseId,
                challengeRecId: Joi.string().required(),
              },
            },
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationController.neutralizeChallenge,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification/deneutralize-challenge',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                certificationCourseId: identifiersType.certificationCourseId,
                challengeRecId: Joi.string().required(),
              },
            },
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationController.deneutralizeChallenge,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'certifications-api';
export { name, register };
