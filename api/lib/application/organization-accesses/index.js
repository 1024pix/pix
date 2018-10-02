const securityController = require('../../interfaces/controllers/security-controller');
const organisationAccessController = require('./organization-access-controller');

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'POST',
      path: '/api/organization-accesses',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: organisationAccessController.create,
        tags: ['api']
      }
    },
  ]);

  return next();
};

exports.register.attributes = {
  name: 'organization-accesses-api',
  version: '1.0.0'
};
