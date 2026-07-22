import Joi from 'joi';

import { sendJsonApiError, UnprocessableEntityError } from '../../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD, ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { usecases } from '../domain/usecases/index.js';
import { organizationLearnersController } from './organization-learners-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/organization-learners/filters',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: organizationLearnersController.getOrganizationLearnerFilters,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés membres de l'organisation**\n" +
            "- Elle retourne les filtres disponibles pour les participants de l'organisation.",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/organizations/{organizationId}/organization-learners',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
          {
            method: securityPreHandlers.checkUserDoesNotBelongsToScoOrganizationManagingStudents,
            assign: 'isNotFromScoOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          payload: Joi.object({
            listLearners: Joi.array().required().items(Joi.number().required()),
          }),
        },
        handler: organizationLearnersController.deleteOrganizationLearners,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet l'ajout d'un deletedAt et d'un deletedBy aux prescrits",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/organizations/{organizationId}/organization-learners/{organizationLearnerId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkOrganizationLearnerBelongsToOrganization,
            assign: 'organizationLearnerBelongsToOrganization',
          },
          {
            method: securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            ]),
            assign: 'hasAtLeastOneAccessOf',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
            organizationLearnerId: identifiersType.organizationLearnerId,
          }),
        },
        handler: organizationLearnersController.deleteOrganizationLearnerFromAdmin,
        notes: [
          '- **This is a restricted endpoint to ADMIN_SUPPORT member from Administration back office**\n' +
            '- it allows to delete an organization learner belonging to an organization',
        ],
        tags: ['api', 'admin', 'organization-learners'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/organizations/{organizationId}/organization-learners/{organizationLearnerId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
          {
            method: securityPreHandlers.checkOrganizationLearnerBelongsToOrganization,
            assign: 'organizationLearnerBelongsToOrganization',
          },
          {
            method: securityPreHandlers.checkOrganizationIsNotManagingStudents,
            assign: 'organizationIsNotManagingStudents',
          },
          {
            method: securityPreHandlers.checkOrganizationDoesNotHaveFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT.key),
            assign: 'organizationDoesNotHaveFeature',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
            organizationLearnerId: identifiersType.organizationLearnerId,
          }),
          payload: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
          }),
        },
        handler: organizationLearnersController.updateOrganizationLearnerName,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet la mise à jour du prénom et nom d'un prescrit",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{organizationId}/import-organization-learners',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT.key),
            assign: 'makeCheckOrganizationHasFeature',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          output: 'file',
          failAction: async (request, h) => {
            const authenticatedUserId = request.auth.credentials.userId;
            const organizationId = request.params.organizationId;
            try {
              await usecases.handlePayloadTooLargeError({ organizationId, userId: authenticatedUserId });
            } catch (error) {
              return sendJsonApiError(error, h);
            }
          },
        },
        handler: organizationLearnersController.importOrganizationLearnerFromFeature,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet de mettre à jour la liste des participants de l'organisation.",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/organization-learners/reconcile',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': identifiersType.organizationId,
                'reconciliation-infos': Joi.object().required(),
              },
              type: Joi.string().required(),
            },
          }),
        },
        handler: organizationLearnersController.reconcileCommonOrganizationLearner,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet de mettre se reconcilier auprès d'une organisation ayant la fonctionnalité d'import.",
        ],
        tags: ['api', 'organization-learners', 'reconciliation'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/association/auto',
      config: {
        handler: organizationLearnersController.reconcileScoOrganizationLearnerAutomatically,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': Joi.number().required(),
              },
              type: 'sco-organization-learners',
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle essaye d’associer automatiquement l’utilisateur à l’inscription de l’élève dans cette organisation',
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
  ]);

  server.route([
    {
      method: 'DELETE',
      path: '/api/admin/organization-learners/{id}/association',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationLearnersController.dissociate,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationLearnerId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle dissocie un utilisateur d’un prescrit',
        ],
        tags: ['api', 'admin', 'organization-learners'],
      },
    },
  ]);
};

export const organizationLearnersRoute = {
  name: 'prescription/learner-management/organization-learners-api',
  register,
};
