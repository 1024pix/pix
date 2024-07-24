import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { optionalIdentifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationCenterController } from './certification-center.admin.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certification-centers',
      config: {
        handler: certificationCenterController.findPaginatedFilteredCertificationCenters,
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
          query: Joi.object({
            page: Joi.object({
              number: Joi.number().integer(),
              size: Joi.number().integer(),
            }).default({}),
            filter: Joi.object({
              id: optionalIdentifiersType.certificationCenterId,
              name: Joi.string().trim().empty('').allow(null).optional(),
              type: Joi.string().trim().empty('').allow(null).optional(),
              externalId: Joi.string().trim().empty('').allow(null).optional(),
            }).default({}),
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Liste des centres de certification\n',
        ],
        tags: ['api', 'certification-center'],
      },
    },
  ]);
};

const name = 'certification-centers-admin';
export { name, register };
