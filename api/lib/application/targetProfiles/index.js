const targetProfileController = require('./target-profile-controller');

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        handler: targetProfileController.findTargetProfiles,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des profiles cibles utilisables par l‘organisation\n'
        ],
        tags: ['api', 'target-profile']
      }

    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'target-profiles-api',
  version: '1.0.0'
};
