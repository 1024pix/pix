const securityController = require('../../interfaces/controllers/security-controller');
const organisationController = require('./organization-controller');
const snapshotsAuthorization = require('../../application/preHandlers/snapshot-authorization');

exports.register = (server, options, next) => {
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
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/organizations',
      config: {
        handler: organisationController.search,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle peut être utilisée dans 3 cas : \n- un usager qui souhaite partager son profil de compétences avec une organisation (retourne un tableau vide)\n- à la connexion d’un prescripteur (pour détecter qu’il est bien prescripteur (retourne un tableau avec 1 seul élément)\n- un Pix master qui souhaite consulter la liste de toutes les organisations (retourne un tableau avec n éléments)',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/snapshots',
      config: { handler: organisationController.getSharedProfiles, tags: ['api'] }
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
        handler: organisationController.exportSharedSnapshotsAsCsv, tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/campaigns',
      config: {
        handler: organisationController.getCampaigns,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les campagnes rattachées à l’organisation.',
        ]
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'organization-api',
  version: '1.0.0'
};
