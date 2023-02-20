import complementaryCertificationController from './complementary-certification-controller';
import securityPreHandlers from '../security-pre-handlers';

export const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/habilitations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: complementaryCertificationController.findComplementaryCertifications,
        tags: ['api'],
        notes: [
          'Cette route est utilisée par Pix Admin',
          'Elle renvoie la liste des certifications complémentaires existantes.',
        ],
      },
    },
  ]);
};

export const name = 'complementary-certifications-api';
