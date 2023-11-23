import Joi from 'joi';
import { autonomousCourseController } from './autonomous-course-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/autonomous-courses',
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
        handler: autonomousCourseController.save,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('autonomous-courses'),
              attributes: Joi.object({
                targetProfileId: identifiersType.targetProfileId,
                internalTitle: Joi.string().required(),
                publicTitle: Joi.string().required(),
                customLandingPageText: Joi.string().allow(null).optional(),
              }),
            }),
          }),
        },
        notes: [
          '- **Route nécessitant une authentification**\n' + '- Cette route permet de créer un parcours autonome.',
        ],
        tags: ['api', 'autonomous-courses'],
      },
    },
  ]);
};

const name = 'autonomous-courses-api';
export { register, name };
