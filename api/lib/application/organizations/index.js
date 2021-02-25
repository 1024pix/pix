const Joi = require('joi');

const { sendJsonApiError, PayloadTooLargeError, NotFoundError, BadRequestError } = require('../http-errors');
const securityPreHandlers = require('../security-pre-handlers');
const organizationController = require('./organization-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: organizationController.create,
        tags: ['api', 'organizations'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          options: {
            allowUnknown: true,
          },
          query: Joi.object({
            'filter[id]': Joi.number().integer().empty('').allow(null).optional(),
            'filter[name]': Joi.string().empty('').allow(null).optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
          },
        },
        handler: organizationController.findPaginatedFilteredOrganizations,
        tags: ['api', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer & chercher une liste d’organisations\n' +
          '- Cette liste est paginée et filtrée selon un **name** et/ou un **type** et/ou un **identifiant externe** donnés',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.getOrganizationDetails,
        tags: ['api', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer toutes les informations d’une organisation',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/organizations/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.updateOrganizationInformation,
        tags: ['api', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de mettre à jour tout ou partie d’une organisation',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/campaigns',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPaginatedFilteredCampaigns,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les campagnes rattachées à l’organisation.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster,
          assign: 'belongsToOrganization',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPaginatedFilteredMemberships,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les membres rattachées à l’organisation.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/certification-results',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkIsCertificationResultsInOrgaToggleEnabled,
            assign: 'isCertificationResultsInOrgaEnabled',
          },
          {
            method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
            assign: 'belongsToOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.downloadCertificationResults,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les certifications liées à l\'organisation sous forme de fichier CSV.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        handler: organizationController.findTargetProfiles,
        tags: ['api', 'target-profile'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des profiles cibles utilisables par l‘organisation\n',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: organizationController.attachTargetProfiles,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'target-profiles-to-attach': Joi.array().items(Joi.string().pattern(/^[0-9]+$/), Joi.number().integer()),
              },
            },
          }).options({ allowUnknown: true }),
          failAction: (request, h) => {
            return sendJsonApiError(new NotFoundError('L\'id d\'un des profils cible n\'est pas valide'), h);
          },
        },
        tags: ['api', 'organizations'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/students',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToOrganizationManagingStudents,
          assign: 'belongsToOrganizationManagingStudents',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
          }).options({ allowUnknown: true }),
        },
        handler: organizationController.findPaginatedFilteredSchoolingRegistrations,
        tags: ['api', 'students'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des élèves liés à une organisation\n',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/schooling-registrations/import-siecle',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
          assign: 'isAdminInOrganizationManagingStudents',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            format: Joi.string().default('xml'),
          }),
        },
        payload: {
          maxBytes: 1048576 * 20, // 20MB
          output: 'file',
        },
        handler: organizationController.importSchoolingRegistrationsFromSIECLE,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l\'organisation**\n' +
          '- Elle permet d\'importer des inscriptions d\'élèves, en masse, depuis un fichier au format XML ou CSV de SIECLE\n' +
          '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'schooling-registrations'],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/schooling-registrations/import-csv',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
          assign: 'isAdminInOrganizationManagingStudents',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        payload: {
          maxBytes: 1048576 * 10, // 10MB
          parse: 'gunzip',
          failAction: (request, h) => {
            return sendJsonApiError(new PayloadTooLargeError(), h);
          },
        },
        handler: organizationController.importHigherSchoolingRegistrations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l\'organisation**\n' +
          '- Elle permet d\'importer des inscriptions d\'étudiants, en masse, depuis un fichier au format csv\n' +
          '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'schooling-registrations'],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/invitations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster,
          assign: 'isAdminInOrganizationOrHasRolePixMaster',
        }],
        handler: organizationController.sendInvitations,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email({ multiple: true }).required(),
              },
            },
          }),
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l\'organisation ou ayant le rôle Pix Master**\n' +
          '- Elle permet d\'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d\'une organisation, via leur **email**',
        ],
        tags: ['api', 'invitations'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/invitations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInOrganization,
          assign: 'isAdminInOrganization',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationController.findPendingInvitations,
        tags: ['api', 'invitations'],
        notes: [
          '- Cette route est restreinte aux utilisateurs authentifiés responsables de l\'organisation',
          '- Elle permet de lister les invitations en attente d\'acceptation d\'une organisation',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/schooling-registrations/csv-template',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            accessToken: Joi.string().required(),
          }).options({ allowUnknown: true }),
        },
        handler: organizationController.getSchoolingRegistrationsCsvTemplate,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un template CSV qui servira à téléverser les inscriptions d’étudiants\n' +
          '- L‘utilisateur doit avoir les droits d‘accès ADMIN à l‘organisation',
        ],
        tags: ['api', 'schooling-registrations'],
      },
    },
  ]);
};

exports.name = 'organization-api';
