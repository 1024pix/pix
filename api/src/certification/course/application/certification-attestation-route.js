import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { certificationAttestationController } from './certification-attestation-controller.js';
import { LOCALE } from '../../../shared/domain/constants.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
const { FRENCH_SPOKEN, ENGLISH_SPOKEN } = LOCALE;

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/sessions/{id}/attestations',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
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
        handler: certificationAttestationController.getCertificationPDFAttestationsForSession,
        plugins: {
          'hapi-swagger': {
            produces: ['application/pdf'],
          },
        },
        notes: [
          '- **Route accessible par un user Admin**\n' +
            "- Récupération des attestations de certification d'une session au format PDF" +
            ' via un id de session et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
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
            lang: Joi.string().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
        },
        handler: certificationAttestationController.getPDFAttestation,
        notes: [
          '- **Route accessible par un user authentifié**\n' +
            '- Récupération des informations d’une attestation de certification au format PDF' +
            ' via un id de certification et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/certification-attestations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
            assign: 'belongsToOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            division: Joi.string().required(),
            isFrenchDomainExtension: Joi.boolean().required(),
            lang: Joi.string().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
        },
        handler: certificationAttestationController.downloadCertificationAttestationsForDivision,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne les certificats par classe liées à l'organisation sous forme de fichier PDF.",
        ],
      },
    },
  ]);
};

const name = 'certification-attestation-api';
export { register, name };
