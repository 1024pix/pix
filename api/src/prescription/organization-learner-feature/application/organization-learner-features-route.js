import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { organizationLearnerFeaturesController } from './organization-learner-features-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations/{organizationId}/organization-learners/{organizationLearnerId}/features/{featureKey}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
          {
            method: securityPreHandlers.checkUserBelongsToLearnersOrganization,
            assign: 'checkUserBelongsToLearnersOrganization',
          },
          {
            method: securityPreHandlers.checkOrganizationHasFeature,
            assign: 'checkOrganizationHasFeature',
          },
        ],
        validate: {
          params: Joi.object({
            featureKey: Joi.string().required(),
            organizationId: Joi.number().integer().required(),
            organizationLearnerId: Joi.number().integer().required(),
          }),
        },
        handler: organizationLearnerFeaturesController.create,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          "- L'utilisateur doit être membre de l'organisation fournie",
          "- L'utilisateur doit appartenir à la même organisation que le participant",
          "- L'organisation doit avoir la fonctionnalité à attribuer au participant",
          'Cette route attribue au participant la fonctionnalité demandée.',
        ],
        tags: ['api', 'organization'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/organizations/{organizationId}/organization-learners/{organizationLearnerId}/features/{featureKey}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
          {
            method: securityPreHandlers.checkUserBelongsToLearnersOrganization,
            assign: 'checkUserBelongsToLearnersOrganization',
          },
          {
            method: securityPreHandlers.checkOrganizationHasFeature,
            assign: 'checkOrganizationHasFeature',
          },
        ],
        validate: {
          params: Joi.object({
            featureKey: Joi.string().required(),
            organizationId: Joi.number().integer().required(),
            organizationLearnerId: Joi.number().integer().required(),
          }),
        },
        handler: organizationLearnerFeaturesController.unlink,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          "- L'utilisateur doit être membre de l'organisation fournie",
          "- L'utilisateur doit appartenir à la même organisation que le participant",
          "- L'organisation doit avoir la fonctionnalité à retirer au participant",
          'Cette route retire au participant la fonctionnalité demandée.',
        ],
        tags: ['api', 'organization'],
      },
    },
  ]);
};

const name = 'organization-learner-feature-route';
export { name, register };
