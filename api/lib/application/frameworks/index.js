import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { frameworksController as frameworkController } from './frameworks-controller.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/frameworks',
      config: {
        handler: frameworkController.getFrameworks,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        tags: ['api', 'admin', 'framework'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          'Elle permet de récupérer la liste des référentiels disponibles',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/frameworks/{id}/areas',
      config: {
        handler: frameworkController.getFrameworkAreas,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.frameworkId,
          }),
        },
        tags: ['api', 'admin', 'framework'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          "Elle permet de récupérer tous les domaines d'un référentiel avec leurs compétences, thématiques et sujets",
        ],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'GET',
      path: '/api/frameworks/pix/areas-for-user',
      config: {
        handler: frameworkController.getPixFrameworkAreasWithoutThematics,
        tags: ['api', 'framework'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle permet de récupérer tous les domaines du référentiel pix avec leurs compétences (sans les thématiques)',
        ],
      },
    },
  ]);
};

const name = 'frameworks-api';
export { name, register };
