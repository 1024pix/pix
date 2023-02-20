import Joi from 'joi';
import frameworkController from './frameworks-controller';
import securityPreHandlers from '../security-pre-handlers';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/frameworks',
      config: {
        handler: frameworkController.getFrameworks,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
    {
      method: 'GET',
      path: '/api/frameworks/for-target-profile-submission',
      config: {
        handler: frameworkController.getFrameworksForTargetProfileSubmission,
        pre: [{ method: securityPreHandlers.checkUserIsMemberOfAnOrganization }],
        tags: ['api', 'framework'],
        notes: [
          "Cette route est restreinte aux utilisateurs authentifiés membre d'une organisation",
          'Elle permet de récupérer tous le contenu pédagogique à disposition pour formuler une demande de création de profil cible',
        ],
      },
    },
  ]);
};

export const name = 'frameworks-api';
