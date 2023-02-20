const Joi = require('joi').extend(require('@joi/date'));

import securityPreHandlers from '../security-pre-handlers';
import organizationLearnerController from './organization-learner-controller';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
  const adminRoutes = [
    {
      method: 'DELETE',
      path: '/api/admin/organization-learners/{id}/association',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationLearnerController.dissociate,
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
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'GET',
      path: '/api/organization-learners',
      config: {
        handler: organizationLearnerController.findAssociation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération du prescrit\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'GET',
      path: '/api/organization-learners/{id}/activity',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToLearnersOrganization,
            assign: 'belongsToLearnersOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationLearnerId,
          }),
        },
        handler: organizationLearnerController.getActivity,
        notes: [
          "- **Cette route est restreinte aux membres authentifiés d'une organisation**\n" +
            "- Récupération de l'activité du prescrit\n",
        ],
        tags: ['api', 'organization-learners-activity'],
      },
    },
    {
      method: 'GET',
      path: '/api/organization-learners/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToLearnersOrganization,
            assign: 'belongsToLearnersOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationLearnerId,
          }),
        },
        handler: organizationLearnerController.getLearner,
        notes: [
          "- **Cette route est restreinte aux membres authentifiés d'une organisation**\n" +
            "- Récupération d'un prescrit'\n",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ]);
};

export const name = 'organization-learners-api';
