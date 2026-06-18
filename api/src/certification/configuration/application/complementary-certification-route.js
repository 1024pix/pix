import JoiDate from '@joi/date';
import BaseJoi from 'joi';

const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
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
      method: 'GET',
      path: '/api/admin/complementary-certifications/{complementaryCertificationKey}/target-profiles',
      config: {
        validate: {
          params: Joi.object({
            complementaryCertificationKey: Joi.string().valid(...Object.values(ComplementaryCertificationKeys)),
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: complementaryCertificationController.getComplementaryCertificationTargetProfileHistory,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          "Elle renvoie les profils cibles courants et ses badges associés, ainsi que l'historique des profils cibles qui ont été rattachés à la certification complémentaire.",
        ],
      },
    },
  ]);
};

export const complementaryCertificationRoute = {
  name: 'certification/configuration/complementary-certifications-api',
  register,
};
