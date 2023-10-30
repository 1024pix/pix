import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { organizationLearnersController } from './organization-learners-controller.js';

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
  ]);
};

const name = 'organization-learners-management-api';

export { register, name };
