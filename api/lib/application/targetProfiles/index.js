const targetProfileController = require('./target-profile-controller');

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        handler: targetProfileController.findTargetProfiles,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'target-profiles-api',
  version: '1.0.0'
};
