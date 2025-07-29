import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ENGLISH_SPOKEN, FRENCH_SPOKEN } from '../../../shared/domain/services/locale-service.js';
import { certificationVerificationCodeType, identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificateController } from './certificate-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/attestation/{certificationCourseId}',
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
          query: Joi.object({
            isFrenchDomainExtension: Joi.boolean().required(),
            lang: Joi.string().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
        },
        handler: certificateController.getPDFCertificate,
        notes: [
          '- **Route accessible par un user authentifié**\n' +
            '- Récupération des informations d’un certificat au format PDF' +
            ' via un id de certification et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/certification-attestations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
            assign: 'belongsToOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          query: Joi.object({
            division: Joi.string().required(),
            isFrenchDomainExtension: Joi.boolean().required(),
            lang: Joi.string().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
        },
        handler: certificateController.downloadDivisionCertificates,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne les certificats par classe liées à l'organisation sous forme de fichier PDF.",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/{sessionId}/attestations',
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
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificateController.getSessionCertificates,
        plugins: {
          'hapi-swagger': {
            produces: ['application/pdf'],
          },
        },
        notes: [
          '- **Route accessible par un user Admin**\n' +
            "- Récupération les certificats d'une session au format PDF" +
            ' via un id de session et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
      },
    },
    {
      method: 'POST',
      path: '/api/shared-certifications',
      config: {
        validate: {
          payload: Joi.object({
            verificationCode: certificationVerificationCodeType
              .required()
              .description('Code de vérification du certificat Pix à vérifier'),
          }),
        },
        auth: false,
        handler: certificateController.getCertificateByVerificationCode,
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
      path: '/api/certifications/{certificationCourseId}',
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
        handler: certificateController.getCertificate,
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
        handler: certificateController.findUserCertificates,
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Récupération de toutes les certifications complétées de l’utilisateur courant',
        ],
        tags: ['api', 'certifications'],
      },
    },
  ]);
};

const name = 'certificate-api';
export { name, register };
