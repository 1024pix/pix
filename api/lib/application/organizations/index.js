const securityController = require('../../interfaces/controllers/security-controller');
const organisationController = require('./organization-controller');
const snapshotsAuthorization = require('../../application/preHandlers/snapshot-authorization');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
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
        handler: organisationController.find,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle peut être utilisée dans 3 cas : \n' +
          '- un usager qui souhaite partager son profil de compétences avec une organisation (retourne un tableau vide)\n' +
          '- à la connexion d’un prescripteur (pour détecter qu’il est bien prescripteur (retourne un tableau avec 1 seul élément)\n' +
          '- un Pix master qui souhaite consulter la liste de toutes les organisations (retourne un tableau avec n éléments)',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
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
          method: securityController.checkUserHasRolePixMaster,
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
      path: '/api/organizations/{id}/snapshots/export',
      config: {
        auth: false,
        pre: [{
          method: snapshotsAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: organisationController.exportSharedSnapshotsAsCsv,
        tags: ['api', 'organizations']
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/campaigns',
      config: {
        handler: organisationController.getCampaigns,
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
          method: securityController.checkUserIsOwnerInOrganizationOrHasRolePixMaster,
          assign: 'isOwnerInOrganizationOrHasRolePixMaster'
        }],
        handler: organisationController.getMemberships,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les membres rattachées à l’organisation.',
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/add-membership',
      config: {
        pre: [{
          method: securityController.checkUserIsOwnerInOrganizationOrHasRolePixMaster,
          assign: 'isOwnerInOrganizationOrHasRolePixMaster'
        }],
        handler: organisationController.addOrganizationMembershipWithEmail,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant que PIX_MASTER ou responsables de l\'organisation**\n' +
          '- Elle permet d\'associer un utilisateur à une organisation via son **email**'
        ],
        tags: ['api', 'memberships']
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
      method: 'GET',
      path: '/api/organizations/{id}/students',
      config: {
        pre: [{
          method: securityController.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents'
        }],
        handler: organisationController.findStudents,
        tags: ['api', 'students'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des élèves liés à une organisation\n'
        ]
      }
    }
  ]);
};

exports.name = 'organization-api';
