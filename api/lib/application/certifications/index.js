import Joi from 'joi';
import certificationController from './certification-controller';
import identifiersType from '../../domain/types/identifiers-type';
import securityPreHandlers from '../security-pre-handlers';

export const register = async function (server) {
  server.route([
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
      path: '/api/attestation/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
          query: Joi.object({
            isFrenchDomainExtension: Joi.boolean().required(),
          }),
        },
        handler: certificationController.getPDFAttestation,
        notes: [
          '- **Route accessible par un user authentifié**\n' +
            '- Récupération des informations d’une attestation de certification au format PDF' +
            ' via un id de certification et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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

export const name = 'certifications-api';
