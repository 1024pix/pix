const Joi = require('joi');

const securityPreHandlers = require('../security-pre-handlers');
const certificationCourseController = require('./certification-course-controller');

const identifiersType = require('../../domain/types/identifiers-type');
const config = require('../../config');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}/details',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: (request) => {
          if (config.featureToggles.isNeutralizationAutoEnabled) {
            return certificationCourseController.getCertificationDetails(request);
          } else {
            return certificationCourseController.computeResult(request);
          }
        },
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
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
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
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: certificationCourseController.getCertificationResultInformation,
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
      },
    }, {
      method: 'POST',
      path: '/api/certification-courses',
      config: {
        handler: certificationCourseController.save,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- S\'il existe déjà une certification pour l\'utilisateur courant dans cette session, alors cette route renvoie la certification existante avec un code 200\n' +
          '- Sinon, crée une certification pour l\'utilisateur courant dans la session indiquée par l\'attribut *access-code*, et la renvoie avec un code 201\n',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-courses/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationCourseController.get,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'certification-courses-api';
