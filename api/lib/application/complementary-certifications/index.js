import { complementaryCertificationController } from './complementary-certification-controller.js';
import { securityPreHandlers } from '../security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/complementary-certifications',
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
        handler: complementaryCertificationController.findComplementaryCertifications,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          'Elle renvoie la liste des certifications complémentaires existantes.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/complementary-certifications/{id}/target-profiles',
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
        handler: complementaryCertificationController.getTargetProfileFromComplementaryCertification,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          'Elle renvoie les informations du profil cible courant de la certification complémentaire.',
        ],
      },
    },
  ]);
};

const name = 'complementary-certifications-api';
export { register, name };
