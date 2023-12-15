import { certificationCenterController } from './certification-center-controller.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import Joi from 'joi';
import { identifiersType } from '../../domain/types/identifiers-type.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'POST',
      path: '/api/admin/certification-centers',
      config: {
        handler: certificationCenterController.create,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Création d‘un nouveau centre de certification\n',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-centers',
      config: {
        handler: certificationCenterController.findPaginatedFilteredCertificationCenters,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Liste des centres de certification\n',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-centers/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.getCertificationCenterDetails,
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Récupération d'un centre de certification\n",
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-centers/{certificationCenterId}/certification-center-memberships',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findCertificationCenterMembershipsByCertificationCenter,
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Récupération de tous les membres d'un centre de certification.\n",
        ],
        tags: ['api', 'admin', 'certification-center-membership'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification-centers/{certificationCenterId}/certification-center-memberships',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
          payload: Joi.object().required().keys({
            email: Joi.string().email().required(),
          }),
        },
        handler: certificationCenterController.createCertificationCenterMembershipByEmail,
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Création d‘un nouveau membre d'un centre de certification,\n" +
            "à partir de l'adresse e-mail d'un utilisateur.",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/certification-centers/{id}',
      config: {
        handler: certificationCenterController.update,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Création d‘un nouveau centre de certification\n',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification-centers/{certificationCenterId}/invitations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationCenterController.sendInvitationForAdmin,
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email().required(),
                language: Joi.string().valid('fr-fr', 'fr', 'en'),
                role: Joi.string().valid('ADMIN', 'MEMBER').allow(null),
              },
            },
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet à un administrateur d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'un centre de certification, via leur **email**",
        ],
        tags: ['api', 'invitations', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-centers/{certificationCenterId}/invitations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findPendingInvitations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et ayant accès à Pix Admin**\n' +
            '- Récupération de la liste des invitations en attente liée un centre de certification',
        ],
        tags: ['api', 'certification-center', 'invitations', 'admin'],
      },
    },
  ];
  const certifRoutes = [
    {
      method: 'POST',
      path: '/api/certif/certification-centers/{certificationCenterId}/update-referer',
      config: {
        handler: certificationCenterController.updateReferer,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
            assign: 'isAdminOfCertificationCenter',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Mise à jour du status de référent d'un membre d'un espace pix-certif\n",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    ...certifRoutes,
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students',
      config: {
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
            sessionId: identifiersType.sessionId,
          }),
          query: Joi.object({
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'page[number]': Joi.number().integer(),
            'page[size]': Joi.number().integer(),
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
        ],
        handler: certificationCenterController.getStudents,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération d'une liste d'élèves SCO à partir d'un identifiant de centre de certification",
        ],
        tags: ['api', 'certification-center', 'students', 'session'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/divisions',
      config: {
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.getDivisions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération d'une liste de classes à partir d'un identifiant de centre de certification",
        ],
        tags: ['api', 'certification-center', 'students', 'session'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}/session-summaries',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findPaginatedSessionSummaries,
        tags: ['api', 'certification-center'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          '- Elle retourne les sessions rattachées au centre de certification.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/members',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findCertificationCenterMemberships,
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n' +
            "- Récupération de tous les membres d'un centre de certification.\n",
        ],
        tags: ['api', 'certification-center', 'members'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/import',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
          {
            method: securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents,
            assign: 'isCertificationCenterNotScoManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({ certificationCenterId: identifiersType.certificationCenterId }),
        },
        handler: certificationCenterController.getSessionsImportTemplate,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de récupérer le fichier de création de sessions de certification',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/invitations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
            assign: 'isAdminOfCertificationCenter',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findPendingInvitations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n' +
            '- Récupération de la liste des invitations en attente liée un centre de certification',
        ],
        tags: ['api', 'certification-center', 'invitations'],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/invitations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
            assign: 'isAdminOfCertificationCenter',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                emails: Joi.array().items(Joi.string().email()).required(),
              },
            },
          }),
        },
        handler: certificationCenterController.sendInvitations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables à un centre de certification**\n' +
            "- Elle permet d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'un centre de certification via leur **email**",
        ],
        tags: ['api', 'certification-center', 'invitations'],
      },
    },
  ]);
};

const name = 'certification-centers-api';
export { register, name };
