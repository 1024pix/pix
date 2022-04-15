const certificationCenterController = require('./certification-center-controller');
const securityPreHandlers = require('../security-pre-handlers');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.create,
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            '- Création d‘un nouveau centre de certification\n' +
            '- L‘utilisateur doit avoir les droits d‘accès en tant que Super Admin',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-centers/{id}',
      config: {
        handler: certificationCenterController.update,
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            '- Création d‘un nouveau centre de certification\n' +
            '- L‘utilisateur doit avoir les droits d‘accès en tant que Super Admin',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.findPaginatedFilteredCertificationCenters,
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            '- Liste des centres de certification\n' +
            '- L‘utilisateur doit avoir les droits d‘accès en tant que Super Admin',
        ],
        tags: ['api', 'certification-center'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.getById,
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            "- Récupération d'un centre de certification\n" +
            '- L‘utilisateur doit avoir les droits d‘accès en tant que Super Admin',
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
            "- Récupération d'une liste d'élèves SCO à partir d'un identifiant de centre de certification",
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
            "- Récupération d'une liste de classes à partir d'un identifiant de centre de certification",
        ],
        tags: ['api', 'certification-center', 'students', 'session'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}/session-summaries',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findPaginatedSessionSummaries,
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
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findCertificationCenterMembershipsByCertificationCenter,
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            "- Récupération de tous les membres d'un centre de certification.\n" +
            '- L‘utilisateur doit avoir les droits d‘accès en tant que Super Admin',
        ],
        tags: ['api', 'admin', 'certification-center-membership'],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/members',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: certificationCenterController.findCertificationCenterMemberships,
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n' +
            "- Récupération de tous les membres d'un centre de certification.\n",
        ],
        tags: ['api', 'certification-center', 'members'],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/certification-center-memberships',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
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
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            "- Création d‘un nouveau membre d'un centre de certification,\n" +
            "à partir de l'adresse e-mail d'un utilisateur.",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ]);
};

exports.name = 'certification-centers-api';
