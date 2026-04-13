import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
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
      path: '/api/admin/certification-frameworks/{scope}/active-consolidated-framework',
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
              .valid(...Object.values(SCOPES)),
          }),
        },
        handler: certificationFrameworkController.getActiveConsolidatedFramework,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support, Certif et Métier',
          'Elle renvoie le référentiel cadre actif pour un scope donné (CORE, DROIT, EDU_1ER_DEGRE, EDU_2ND_DEGRE, EDU_CPE, PRO_SANTE).',
          'Le référentiel cadre contient la hiérarchie complète du contenu formatif : areas → competences → thematics → tubes → skills.',
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
      path: '/api/v2/admin/certification-frameworks/{scope}/framework-history',
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
          "Elle permet de récupérer l'historique d'un référentiel de certification, les profils cibles courants et ses badges associés, ainsi que l'historique des profils cibles qui ont été rattachés à la certification complémentaire.\",",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/frameworks/{scope}/new-version',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            scope: Joi.string()
              .required()
              .valid(...Object.values(SCOPES)),
          }),
          payload: Joi.object({
            data: {
              attributes: {
                tubeIds: Joi.array().items(identifiersType.tubeId).min(1).unique().required(),
              },
            },
          }),
        },
        handler: certificationFrameworkController.createCertificationVersion,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de créer une nouvelle version de référentiel de certification',
        ],
      },
    },
  ]);
};

const name = 'certification/configuration/certification-frameworks-api';
export { name, register };
