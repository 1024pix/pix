import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, PayloadTooLargeError, NotFoundError, BadRequestError } from '../http-errors.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { organizationController } from './organization-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';
import { LANG } from '../../../src/shared/domain/constants.js';

const { FRENCH, ENGLISH } = LANG;

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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              ])(request, h),
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
      method: 'GET',
      path: '/api/admin/organizations/{id}/places',
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
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findOrganizationPlacesLot,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle retourne la liste des commandes de places faites par l'organisation",
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/organizations/{id}/places/{placeId}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
            placeId: identifiersType.placeId,
          }),
        },
        handler: organizationController.deleteOrganizationPlacesLot,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet la suppression d'un lot de place",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/places/capacity',
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
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.getOrganizationPlacesCapacity,
        tags: ['api', 'organizations'],
        notes: [
          `- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n- Elle retourne la capacité en places par catégorie pour une organisation`,
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/places',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        handler: organizationController.createOrganizationPlacesLot,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l'organisation**\n" +
            "- Elle permet d'ajouter un lot des places à une organization",
        ],
        tags: ['api', 'organizations'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/invitations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
      path: '/api/organizations/{id}/campaigns',
      config: {
        pre: [{ method: securityPreHandlers.checkUserBelongsToOrganization }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPaginatedFilteredCampaigns,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les campagnes rattachées à l’organisation.',
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
      path: '/api/organizations/{id}/certification-results',
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
            division: Joi.string().optional(),
            lang: Joi.string().optional().valid('fr', 'en'),
          }),
        },
        handler: organizationController.downloadCertificationResults,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne les certifications liées à l'organisation sous forme de fichier CSV.",
        ],
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
            lang: Joi.string().valid(FRENCH, ENGLISH),
          }),
        },
        handler: organizationController.downloadCertificationAttestationsForDivision,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne les certificats par classe liées à l'organisation sous forme de fichier PDF.",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/sup-participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents,
            assign: 'belongsToSupOrganizationAndManagesStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'filter[certificability][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[groups][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[search]': Joi.string().empty(''),
            'filter[studentNumber]': Joi.string().empty(''),
            'sort[participationCount]': Joi.string().empty(''),
            'sort[lastnameSort]': Joi.string().empty(''),
          }),
        },
        handler: organizationController.findPaginatedFilteredSupParticipants,
        tags: ['api', 'organization', 'sup-participants'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés membres d'un espace Orga**\n" +
            '- Récupération des étudiants liés à une organisation SUP\n',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/sco-participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
            assign: 'belongsToScoOrganizationAndManagesStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[connectionTypes][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[search]': Joi.string().empty(''),
            'filter[certificability][]': [Joi.string(), Joi.array().items(Joi.string())],
            'sort[participationCount]': Joi.string().empty(''),
            'sort[lastnameSort]': Joi.string().empty(''),
            'sort[divisionSort]': Joi.string().empty(''),
          }),
        },
        handler: organizationController.findPaginatedFilteredScoParticipants,
        tags: ['api', 'organization', 'sco-participants'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés membres d'un espace Orga**\n" +
            '- Récupération des élèves liés à une organisation SCO\n',
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
    {
      method: 'POST',
      path: '/api/organizations/{id}/sco-organization-learners/import-siecle',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
            assign: 'isAdminInOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            format: Joi.string().default('xml'),
          }),
        },
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
        handler: organizationController.importOrganizationLearnersFromSIECLE,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l'organisation**\n" +
            "- Elle permet d'importer des inscriptions d'élèves, en masse, depuis un fichier au format XML ou CSV de SIECLE\n" +
            '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'filter[fullName]': Joi.string().empty(''),
            'filter[certificability][]': [Joi.string(), Joi.array().items(Joi.string())],
            'sort[participationCount]': Joi.string().empty(''),
            'sort[lastnameSort]': Joi.string().empty(''),
          }),
        },
        handler: organizationController.getPaginatedParticipantsForAnOrganization,
        tags: ['api', 'organization-participants'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des participants d'une organisation sans import\n",
        ],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    ...orgaRoutes,
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findTargetProfiles,
        tags: ['api', 'target-profile'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des profiles cibles utilisables par l‘organisation\n',
        ],
      },
    },
  ]);
};

const name = 'organization-api';
export { register, name };
