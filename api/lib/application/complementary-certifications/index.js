const complementaryCertificationController = require('./complementary-certification-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function (server) {
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

exports.name = 'complementary-certifications-api';
