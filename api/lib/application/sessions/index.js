const Joi = require('@hapi/joi');
const securityController = require('../../interfaces/controllers/security-controller');
const sessionController = require('./session-controller');
const sessionAuthorization = require('../preHandlers/session-authorization');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: sessionController.find,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de consulter la liste de toutes les sessions (retourne un tableau avec n éléments)',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().required()
          }),
        },
        pre: [{
          method: sessionAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: sessionController.get,
        tags: ['api', 'sessions']
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}/attendance-sheet',
      config: {
        auth: false,
        handler: sessionController.getAttendanceSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
          '- Cette route permet de télécharger le pv de session pré-rempli au format ods'
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/sessions',
      config: {
        handler: sessionController.save,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle permet de créer une session de certification liée au centre de certification de l’utilisateur',
        ]
      }
    },
    {
      method: 'PUT',
      path: '/api/sessions/{id}/finalization',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().required()
          }),
        },
        pre: [{
          method: sessionAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: sessionController.finalize,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle permet de finaliser une session de certification afin de la signaler comme terminée',
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/sessions/{id}/certification-candidates/import',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().required()
          }),
        },
        payload: {
          allow: 'multipart/form-data',
          maxBytes: 1048576 * 10, // 10MB
        },
        pre: [{
          method: sessionAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: sessionController.importCertificationCandidatesFromAttendanceSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et appartenant à un centre de certification ayant créé la session**\n' +
          '- Elle permet de récupérer la liste des candidats à inscrire contenue dans le PV de session format ODS envoyé',
        ]
      }
    },
    {
      method: 'PATCH',
      path: '/api/sessions/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().required()
          }),
        },
        pre: [{
          method: sessionAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: sessionController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Modification d\'une session de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la session à modifier',
        ],
        tags: ['api', 'session']
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}/certification-candidates',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().required()
          }),
        },
        pre: [{
          method: sessionAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: sessionController.getCertificationCandidates,
        tags: ['api', 'sessions', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les candidats de certification inscrits à la session.',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}/certifications',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: sessionController.getCertifications,
        tags: ['api', 'sessions', 'certifications'],
        notes: [
          'Cette route est restreinte aux utilisateurs ayant le rôle PIXMASTER',
          'Elle retourne les certifications d\'une session',
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/sessions/{id}/candidate-participation',
      config: {
        handler: sessionController.createCandidateParticipation,
        tags: ['api', 'sessions', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle associe un candidat de certification à une session\n' +
          'à un utilisateur à l\'aide des informations d\'identité de celui-ci (nom, prénom et date de naissance).',
        ]
      }
    },
    {
      method: 'PUT',
      path: '/api/sessions/{id}/certifications/attendance-sheet-analysis',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().required(),
          }),
        },
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        payload: {
          allow: 'multipart/form-data',
          maxBytes: 1048576 * 10, // 10MB
        },
        handler: sessionController.analyzeAttendanceSheet,
        tags: ['api', 'certifications'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de lire et de retourner des données sur les certifications présentes dans le PV de session transmis en buffer',
        ]
      }
    },
  ]);
};

exports.name = 'sessions-api';
