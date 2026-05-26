import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { SCOPES } from '../../shared/domain/models/Scopes.js';
import { certificationFrameworkController } from './certification-framework-controller.js';

const register = async function (server) {
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
      path: '/api/admin/certification-frameworks/{scope}/framework-history',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            scope: Joi.string()
              .required()
              .valid(...Object.values(SCOPES)),
          }),
        },
        handler: certificationFrameworkController.getFrameworkHistory,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec un rôle Super Admin, Certif, Support ou Métier',
          "Elle permet de récupérer l'historique d'un référentiel de certification",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-frameworks/{scope}/target-profiles',
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
            scope: Joi.string()
              .required()
              .valid(...Object.values(SCOPES).filter((s) => s !== SCOPES.CORE)),
          }),
        },
        handler: certificationFrameworkController.getTargetProfileHistory,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support, Certif et Métier',
          "Elle renvoie l'historique des profils cibles rattachés à un référentiel de certification.",
        ],
      },
    },
  ]);
};

const name = 'certification/configuration/certification-frameworks-api';
export { name, register };
