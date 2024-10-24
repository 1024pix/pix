import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationLearnerFeaturesController } from './organization-learner-features-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations/{organizationId}/organization-learner/{organizationLearnerId}/features/{featureKey}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
        ],
        validate: {
          query: Joi.object({
            featureKey: Joi.string().required(),
            organizationId: Joi.number().integer().required(),
            organizationLearnerId: Joi.number().integer().required(),
          }),
        },
        handler: organizationLearnerFeaturesController.createOrganizationLearnerFeatures,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- L'utisateur doit être au moins membre de l'organisation'",
        ],
        tags: ['api', 'organization'],
      },
    },
  ]);
};

const name = 'organization-learners-route';
export { name, register };
