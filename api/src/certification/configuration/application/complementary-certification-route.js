import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { ComplementaryCertificationKeys } from '../../shared/domain/models/ComplementaryCertificationKeys.js';
import { complementaryCertificationController } from './complementary-certification-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/complementary-certifications',
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
        handler: complementaryCertificationController.findComplementaryCertifications,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support, Certif et Métier',
          'Elle renvoie la liste des certifications complémentaires existantes.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/complementary-certifications/attachable-target-profiles',
      config: {
        validate: {
          query: Joi.object({
            searchTerm: Joi.string().allow(null, '').optional(),
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: complementaryCertificationController.searchAttachableTargetProfilesForComplementaryCertifications,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          'Elle renvoie les profils cibles qui peuvent être attachés à un certification complémentaire.',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/complementary-certifications/{complementaryCertificationKey}/consolidated-framework',
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
            complementaryCertificationKey: Joi.string().valid(...Object.values(ComplementaryCertificationKeys)),
          }),
          payload: Joi.object({
            data: {
              attributes: {
                tubeIds: Joi.array().items(identifiersType.tubeId).min(1).unique().required(),
              },
            },
          }),
        },
        handler: complementaryCertificationController.createConsolidatedFramework,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de créer un nouveau référentiel cadre pour une complémentaire à partir de sujets',
        ],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/complementary-certifications/{complementaryCertificationKey}/consolidated-framework',
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
            complementaryCertificationKey: Joi.string().valid(...Object.values(ComplementaryCertificationKeys)),
          }),
        },
        handler: complementaryCertificationController.updateConsolidatedFrameworkCalibration,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de déclencher la récupération de la calibration de chacun des épreuves du référentiel',
        ],
      },
    },
  ]);
};

const name = 'complementary-certifications-api';
export { name, register };
