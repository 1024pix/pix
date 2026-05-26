import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { SCOPES } from '../../shared/domain/models/Scopes.js';
import { certificationVersionController } from './certification-version-controller.js';

const Joi = BaseJoi.extend(JoiDate);

const register = async function (server) {
  server.route([
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
        handler: certificationVersionController.createCertificationVersion,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de créer une nouvelle version de référentiel de certification',
        ],
      },
    },
  ]);
};

const name = 'certification/configuration/certification-versions-api';
export { name, register };
