import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, PayloadTooLargeError, NotFoundError, BadRequestError } from '../http-errors.js';
import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { organizationController } from './organization-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const TWENTY_MEGABYTES = 1048576 * 20;

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'POST',
      path: '/api/admin/organizations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationController.create,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- SUPER_ADMIN, SUPPORT ou METIER\n' +
            '- Elle permet de créer une nouvelle organisation',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/import-csv',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          maxBytes: TWENTY_MEGABYTES,
          output: 'file',
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: organizationController.createInBatch,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de créer de nouvelles organisations en masse.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          options: {
            allowUnknown: true,
          },
          query: Joi.object({
            'filter[id]': identifiersType.organizationId.empty('').allow(null).optional(),
            'filter[name]': Joi.string().empty('').allow(null).optional(),
            'filter[hideArchived]': Joi.boolean().optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
          },
        },
        handler: organizationController.findPaginatedFilteredOrganizations,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle permettant un accès à l'admin de Pix**\n" +
            '- Elle permet de récupérer & chercher une liste d’organisations\n' +
            '- Cette liste est paginée et filtrée selon un **name** et/ou un **type** et/ou un **identifiant externe** donnés',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/archive',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.archiveOrganization,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet d'archiver une organisation",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/campaigns',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
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
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPaginatedCampaignManagements,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux administrateurs authentifiés',
          'Elle retourne toutes les campagnes rattachées à l’organisation.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/invitations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
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
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPendingInvitations,
        tags: ['api', 'invitations', 'admin'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de lister les invitations en attente d'acceptation d'une organisation",
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/organizations/{id}/invitations/{organizationInvitationId}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
            organizationInvitationId: identifiersType.organizationInvitationId,
          }),
        },
        handler: organizationController.cancelOrganizationInvitation,
        tags: ['api', 'admin', 'invitations', 'cancel'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet d'annuler une invitation envoyée mais non acceptée encore.",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/invitations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationController.sendInvitationByLangAndRole,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email().required(),
                lang: Joi.string().valid('fr-fr', 'fr', 'en'),
                role: Joi.string().valid('ADMIN', 'MEMBER').allow(null),
              },
            },
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'une organisation, via leur **email**",
        ],
        tags: ['api', 'invitations'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/attach-target-profiles',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            'target-profile-ids': Joi.array().items(Joi.number().integer()).required(),
          }),
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          failAction: (request, h) => {
            return sendJsonApiError(
              new NotFoundError("L'id d'un des profils cible ou de l'organisation n'est pas valide"),
              h,
            );
          },
        },
        handler: organizationController.attachTargetProfiles,
        tags: ['api', 'admin', 'target-profiles', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher des profil cibles à une organisation',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/target-profile-summaries',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
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
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findTargetProfileSummariesForAdmin,
        tags: ['api', 'organizations', 'target-profiles'],
        notes: [
          `- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n- Elle retourne la liste des profil cibles d'une organisation`,
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/memberships',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'belongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPaginatedFilteredMembershipsForAdmin,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs de Pix Admin',
          'Elle retourne les rôles des membres rattachés à l’organisation de manière paginée.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}/children',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
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
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findChildrenOrganizationsForAdmin,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle permettant un accès à l'admin de Pix**\n" +
            '- Elle permet de récupérer la liste des organisations enfants',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/attach-child-organization',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          payload: Joi.object({
            childOrganizationId: identifiersType.organizationId,
          }),
        },
        handler: organizationController.attachChildOrganization,
        tags: ['api', 'admin', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER ou SUPPORT permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet d'attacher une organization parente à une organization enfant",
        ],
      },
    },
  ];

  const orgaRoutes = [
    {
      method: 'GET',
      path: '/api/organizations/{id}/memberships',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'belongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPaginatedFilteredMemberships,
        tags: ['api', 'organizations'],
        notes: [
          "Cette route est restreinte aux membres authentifiés d'une organisation",
          'Elle retourne les rôles des membres rattachés à l’organisation de manière paginée.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/invitations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPendingInvitations,
        tags: ['api', 'invitations'],
        notes: [
          "- Cette route est restreinte aux utilisateurs authentifiés responsables de l'organisation",
          "- Elle permet de lister les invitations en attente d'acceptation d'une organisation",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/invitations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        handler: organizationController.sendInvitations,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email({ multiple: true }).required(),
              },
            },
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l'organisation**\n" +
            "- Elle permet d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'une organisation, via leur **email**",
        ],
        tags: ['api', 'invitations'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/organizations/{id}/resend-invitation',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        handler: organizationController.resendInvitation,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email().required(),
              },
            },
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l'organisation**\n" +
            "- Elle permet de renvoyer une invitation à une personne, déjà utilisateur de Pix ou non, à être membre d'une organisation, via leur **adresse e-mail**",
        ],
        tags: ['api', 'invitations'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/organizations/{id}/invitations/{organizationInvitationId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
            organizationInvitationId: identifiersType.organizationInvitationId,
          }),
        },
        handler: organizationController.cancelOrganizationInvitation,
        tags: ['api', 'invitations', 'cancel'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'admin d'une organisation**\n" +
            "- Elle permet à l'administrateur de l'organisation d'annuler une invitation envoyée mais non acceptée encore.",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/member-identities',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'belongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.getOrganizationMemberIdentities,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne l'identité des membres rattachés à l’organisation.",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/divisions',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.getDivisions,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les classes rattachées à l’organisation.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/groups',
      config: {
        pre: [{ method: securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.getGroups,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les groupes rattachés à l’organisation.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/sup-organization-learners/csv-template',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            accessToken: Joi.string().required(),
          }).options({ allowUnknown: true }),
        },
        handler: organizationController.getOrganizationLearnersCsvTemplate,
        notes: [
          "- **Cette route est restreinte via un token dédié passé en paramètre avec l'id de l'utilisateur.**",
          "- Récupération d'un template CSV qui servira à téléverser les inscriptions d’étudiants",
          '- L‘utilisateur doit avoir les droits d‘accès ADMIN à l‘organisation',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ];

  server.route([...adminRoutes, ...orgaRoutes]);
};

const name = 'organization-api';
export { register, name };
