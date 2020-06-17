const Joi = require('@hapi/joi');

const securityPreHandlers = require('../security-pre-handlers');
const organisationController = require('./organization-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: organisationController.create,
        tags: ['api', 'organizations']
      }
    },
    {
      method: 'GET',
      path: '/api/organizations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: organisationController.findPaginatedFilteredOrganizations,
        tags: ['api', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer & chercher une liste d’organisations\n' +
          '- Cette liste est paginée et filtrée selon un **name** et/ou un **type** et/ou un **identifiant externe** donnés'
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: organisationController.getOrganizationDetails,
        tags: ['api', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer toutes les informations d’une organisation',
        ]
      }
    },
    {
      method: 'PATCH',
      path: '/api/organizations/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: organisationController.updateOrganizationInformation,
        tags: ['api', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de mettre à jour tout ou partie d’une organisation',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/campaigns',
      config: {
        handler: organisationController.findPaginatedFilteredCampaigns,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les campagnes rattachées à l’organisation.',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster,
          assign: 'belongsToOrganization'
        }],
        handler: organisationController.findPaginatedFilteredMemberships,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les membres rattachées à l’organisation.',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        handler: organisationController.findTargetProfiles,
        tags: ['api', 'target-profile'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des profiles cibles utilisables par l‘organisation\n'
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: organisationController.attachTargetProfiles,
        tags: ['api', 'organizations']
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/students',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents'
        }],
        handler: organisationController.findUserWithSchoolingRegistrations,
        tags: ['api', 'students'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des élèves liés à une organisation\n'
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/import-students',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInScoOrganizationAndManagesStudents,
          assign: 'isAdminInScoOrganizationAndManagesStudents'
        }],
        payload: {
          maxBytes: 1048576 * 10, // 10MB
          parse: 'gunzip',
        },
        handler: organisationController.importSchoolingRegistrationsFromSIECLE,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l\'organisation**\n' +
          '- Elle permet d\'importer des inscriptions d\'élèves, en masse, depuis un fichier au format SIECLE\n' +
          '- Elle ne retourne aucune valeur de retour'
        ],
        tags: ['api', 'students']
      }
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/invitations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster,
          assign: 'isAdminInOrganizationOrHasRolePixMaster'
        }],
        handler: organisationController.sendInvitations,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email({ multiple: true }).required(),
              }
            }
          })
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l\'organisation ou ayant le rôle Pix Master**\n' +
          '- Elle permet d\'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d\'une organisation, via leur **email**'
        ],
        tags: ['api', 'invitations']
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/invitations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInOrganization,
          assign: 'isAdminInOrganization'
        }],
        handler: organisationController.findPendingInvitations,
        tags: ['api', 'invitations'],
        notes: [
          '- Cette route est restreinte aux utilisateurs authentifiés responsables de l\'organisation',
          '- Elle permet de lister les invitations en attente d\'acceptation d\'une organisation',
        ],
      },
    },
  ]);
};

exports.name = 'organization-api';
