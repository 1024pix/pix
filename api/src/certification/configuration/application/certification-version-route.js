import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { Frameworks } from '../../shared/domain/models/Frameworks.js';
import { SCOPES } from '../../shared/domain/models/Scopes.js';
import { certificationVersionController } from './certification-version-controller.js';

const Joi = BaseJoi.extend(JoiDate);

async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certifications/{framework}/info',
      config: {
        validate: {
          params: Joi.object({
            framework: Joi.string()
              .required()
              .valid(...Object.values(Frameworks)),
          }),
        },
        handler: certificationVersionController.getInfo,
        tags: ['api', 'mon-pix'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle permet de récupérer les informations générales concernant un test de certification',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certification-versions/{certificationVersionId}',
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
            certificationVersionId: identifiersType.certificationVersionId,
          }),
        },
        handler: certificationVersionController.getVersionById,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle permet de récupérer une version par son id',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/certification-versions/{certificationVersionId}',
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
            certificationVersionId: identifiersType.certificationVersionId,
          }),
          payload: Joi.object({
            data: Joi.object({
              id: Joi.number(),
              attributes: Joi.object({
                'start-date': Joi.date().allow(null).optional(),
                'expiration-date': Joi.date().allow(null).optional(),
                'assessment-duration': Joi.number().required(),
                'minimum-answers-required-for-validation': Joi.number().required(),
                'maximum-assessment-length': Joi.number().required(),
                comments: Joi.string().max(500).allow(null, '').optional(),
              }).required(),
              type: Joi.string(),
              relationships: Joi.object().optional(),
            }),
          }),
        },
        handler: certificationVersionController.update,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle permet de modifier les commentaires d'une version",
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/certification-versions/{certificationVersionId}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            certificationVersionId: identifiersType.certificationVersionId,
          }),
        },
        handler: certificationVersionController.deleteCertificationVersion,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          "Elle supprime une version de référentiel de certification en cours d'édition.",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification-versions',
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
          payload: Joi.object({
            data: {
              attributes: {
                tubeIds: Joi.array().items(identifiersType.tubeId).min(1).unique().required(),
                scope: Joi.string()
                  .required()
                  .valid(...Object.values(SCOPES)),
              },
            },
          }),
        },
        handler: certificationVersionController.createDraft,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          "Elle permet de créer un nouveau millésime draft d'un référentiel de certification",
        ],
      },
    },
  ]);
}

export const certificationVersionRoute = { name: 'certification/configuration/certification-versions-api', register };
