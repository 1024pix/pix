import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { Frameworks } from '../../shared/domain/models/Frameworks.js';
import { certificationFrameworkController } from './certification-framework-controller.js';

async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certification-frameworks',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationFrameworkController.findCertificationFrameworks,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support, Certif et Métier',
          'Elle renvoie la liste des référentiels de certification existants.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-frameworks/{framework}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            framework: Joi.string()
              .required()
              .valid(...Object.values(Frameworks)),
          }),
        },
        handler: certificationFrameworkController.findCertificationFramework,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support, Certif et Métier',
          'Elle renvoie un référentiel de certification.',
        ],
      },
    },
  ]);
}

export const certificationFrameworkRoute = {
  name: 'certification/configuration/certification-frameworks-api',
  register,
};
