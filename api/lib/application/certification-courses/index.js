import Joi from 'joi';

import { securityPreHandlers } from '../security-pre-handlers.js';
import { certificationCourseController } from './certification-course-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}/details',
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
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationCourseController.getCertificationDetails,
        tags: ['api'],
        notes: [
          'Cette route est utilisé par Pix Admin',
          'Elle sert au cas où une certification a eu une erreur de calcul',
          'Cette route ne renvoie pas le bon format.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}/certified-profile',
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
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationCourseController.getCertifiedProfile,
        tags: ['api'],
        notes: [
          'Cette route est utilisé par Pix Admin',
          'Elle permet de récupérer le profil certifié pour une certification donnée',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
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
        handler: certificationCourseController.getJuryCertification,
        tags: ['api'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-courses/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationCourseController.update,
        tags: ['api'],
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-courses',
      config: {
        handler: certificationCourseController.save,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'access-code': Joi.string().required(),
                'session-id': identifiersType.sessionId,
              },
            },
          }),
          headers: Joi.object({
            'accept-language': Joi.string(),
          }),
          options: {
            allowUnknown: true,
          },
        },
        notes: [
          '- **Route nécessitant une authentification**\n' +
            "- S'il existe déjà une certification pour l'utilisateur courant dans cette session, alors cette route renvoie la certification existante avec un code 200\n" +
            "- Sinon, crée une certification pour l'utilisateur courant dans la session indiquée par l'attribut *access-code*, et la renvoie avec un code 201\n",
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-courses/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserOwnsCertificationCourse,
            assign: 'hasAuthorizationToAccessOwnCertificationCourse',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationCourseController.get,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification-courses/{id}/cancel',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationCourseController.cancel,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification-courses/{id}/uncancel',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationCourseController.uncancel,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'certification-courses-api';
export { register, name };
