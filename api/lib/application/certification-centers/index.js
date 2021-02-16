const certificationCenterController = require('./certification-center-controller');
const securityPreHandlers = require('../security-pre-handlers');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([

    {
      method: 'POST',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.save,
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Création d‘un nouveau centre de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.findPaginatedFilteredCertificationCenters,
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Liste des centres de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.getById,
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Récupération d\'un centre de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students',
      config: {
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
            sessionId: identifiersType.sessionId,
          }),
          query: Joi.object({
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'page[number]': Joi.number().integer(),
            'page[size]': Joi.number().integer(),
          }),
        },
        handler: certificationCenterController.getStudents,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'une liste d\'élèves SCO à partir d\' un identifiant de centre de certification',
        ],
        tags: ['api', 'certification-center', 'students', 'session'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/divisions',
      config: {
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.getDivisions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'une liste de classes à partir d\' un identifiant de centre de certification',
        ],
        tags: ['api', 'certification-center', 'students', 'session'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}/sessions',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.getSessions,
        tags: ['api', 'certification-center'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          '- Elle retourne les sessions rattachées au centre de certification.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/certification-center-memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findCertificationCenterMembershipsByCertificationCenter,
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Récupération de tous les membres d\'un centre de certification.\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/certification-center-memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
          payload: Joi.object().required().keys({
            email: Joi.string().email().required(),
          }),
        },
        handler: certificationCenterController.createCertificationCenterMembershipByEmail,
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Création d‘un nouveau membre d\'un centre de certification,\n' +
          'à partir de l\'adresse e-mail d\'un utilisateur.',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ]);
};

exports.name = 'certification-centers-api';
