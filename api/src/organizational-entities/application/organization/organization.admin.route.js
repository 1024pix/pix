import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import {
  BadRequestError,
  PayloadTooLargeError,
  sendJsonApiError,
} from '../../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../../shared/domain/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationAdminController } from './organization.admin.controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const TWO_AND_HALF_MEGABYTES = 1048576 * 2.5;

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/organizations/import-csv',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
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
        handler: organizationAdminController.createInBatch,
        tags: ['api', 'admin', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de créer de nouvelles organisations en masse.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/import-csv/template',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => organizationAdminController.getTemplateForCreateOrganizationsInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'tags'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de télécharger le template pour créer de nouvelles organisations en masse.',
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
        handler: organizationAdminController.findChildrenOrganizations,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle permettant un accès à l'admin de Pix**\n" +
            '- Elle permet de récupérer la liste des organisations filles',
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
            filter: Joi.object({
              id: identifiersType.organizationId.empty('').allow(null).optional(),
              name: Joi.string().empty('').allow(null).optional(),
              hideArchived: Joi.boolean().optional(),
              administrationTeamId: identifiersType.administrationTeamId.empty('').allow(null).optional(),
            }).default({}),
            page: Joi.object({
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().empty('').allow(null).optional(),
            }).default({}),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
          },
        },
        handler: organizationAdminController.findPaginatedFilteredOrganizations,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle permettant un accès à l'admin de Pix**\n" +
            '- Elle permet de récupérer & chercher une liste d’organisations\n' +
            '- Cette liste est paginée et filtrée selon un **name** et/ou un **type** et/ou un **identifiant externe** et/ou une **équipe en charge** donnés',
        ],
      },
    },
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
        handler: organizationAdminController.create,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- SUPER_ADMIN, SUPPORT ou METIER\n' +
            '- Elle permet de créer une nouvelle organisation',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}',
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
        handler: (request, h) => organizationAdminController.getOrganizationDetails(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer toutes les informations d’une organisation',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/organizations/{organizationId}',
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
            organizationId: identifiersType.organizationId,
          }),
        },
        payload: {
          maxBytes: TWO_AND_HALF_MEGABYTES,
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSizeInMegaBytes: '2.5',
              }),
              h,
            );
          },
        },
        handler: (request, h) => organizationAdminController.updateOrganizationInformation(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de mettre à jour tout ou partie d’une organisation',
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
        handler: organizationAdminController.archiveOrganization,
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet d'archiver une organisation",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/batch-archive/template',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => organizationAdminController.getTemplateForArchiveOrganizationsInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'tags'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de télécharger le template pour archiver des organisations en masse.',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/batch-archive',
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
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          multipart: true,
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
        handler: (request, h) => organizationAdminController.archiveInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet d'archiver plusieurs organizations dont les ID sont transmis par un CSV",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/attach-child-organization',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          payload: Joi.object({
            childOrganizationIds: Joi.string().required(),
          }),
        },
        handler: (request, h) => organizationAdminController.attachChildOrganization(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER ou SUPPORT permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet d'attacher une organisation mère à une organisation fille",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/import-tags-csv/template',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => organizationAdminController.getTemplateForAddTagsToOrganizations(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'tags'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de télécharger le template pour ajouter en masse des tags à des organisations.',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/import-tags-csv',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          output: 'file',
        },
        handler: (request, h) => organizationAdminController.addTagsToOrganizations(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'tags'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet d’ajouter en masse des tags à des organisations.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/add-organization-features/template',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => organizationAdminController.getTemplateForAddOrganizationFeatureInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'organization-features'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de télécharger de template du csv pour activer une fonctionnalité à des organisations',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/add-organization-features',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
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
        handler: (request, h) => organizationAdminController.addOrganizationFeatureInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'organization-features'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet d'activer une fonctionnalité à des organisations",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/update-organizations',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
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
        handler: (request, h) => organizationAdminController.updateOrganizationsInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet de mettre à jour des informations d'une ou plusieurs organisations",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/update-organizations/template',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: (request, h) => organizationAdminController.getTemplateForUpdateOrganizationsInBatch(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet de télécharger de template du csv pour mettre à jour des informations d'une ou plusieurs organisations",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{childOrganizationId}/detach-parent-organization',
      config: {
        pre: [
          {
            method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            childOrganizationId: identifiersType.organizationId,
          }),
        },
        handler: (request, h) => organizationAdminController.detachParentOrganization(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de détacher une organization fille de son organization mère.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}/places-statistics',
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
        handler: (request, h) => organizationAdminController.getOrganizationPlacesStatistics(request, h),
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, CERTIF, SUPPORT ou METIER permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet la récuperation des statistiques de places de l'organisation",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}/statistics',
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
        handler: (request, h) => organizationAdminController.getOrganizationStatistics(request, h),
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, CERTIF, SUPPORT ou METIER permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet la récuperation des statistiques de l'organisation",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}/certification-centers',
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
        handler: (request) => organizationAdminController.findAttachedCertificationCenterForAdmin(request),
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, CERTIF, SUPPORT ou METIER permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet la récuperation des informations du centre de certification rattachée à une organisation.',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/attach-certification-centers',
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
          payload: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: (request, h) => organizationAdminController.attachCertificationCenter(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'certification-centers'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER, SUPPORT ou CERTIF permettant un accès à l'application d'administration de Pix**\n" +
            '- Elle permet de rattacher un centre de certification à un organisation donnée.',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/detach-certification-center',
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
        handler: (request, h) => organizationAdminController.detachCertificationCenter(request, h),
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER, SUPPORT ou CERTIF permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet de détacher un centre de certification d'une organisation donnée.",
        ],
      },
    },
  ]);
};

export const organizationAdminRoute = { name: 'organizational-entities/organization-admin-api', register };
