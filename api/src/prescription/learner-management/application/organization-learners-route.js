import Joi from 'joi';

import { sendJsonApiError } from '../../../../lib/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { usecases } from '../domain/usecases/index.js';
import { organizationLearnersController } from './organization-learners-controller.js';

const TWENTY_MEGABYTES = 1048576 * 20;

const register = async (server) => {
  server.route([
    {
      method: 'DELETE',
      path: '/api/organizations/{id}/organization-learners',
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
            id: identifiersType.organizationId,
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
          maxBytes: TWENTY_MEGABYTES,
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
                'campaign-code': Joi.string().required(),
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
  ]);
};

const name = 'organization-learners-management-api';

export { name, register };
