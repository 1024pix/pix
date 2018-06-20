const campaignController = require('./campaign-controller');

exports.register = function(server, options, next) {

  server.route([

    {
      method: 'POST',
      path: '/api/campaigns',
      config: {
        auth: false,
        handler: campaignController.save,
        tags: ['api']
      }
    },

  ]);

  return next();

};

exports.register.attributes = {
  name: 'campaigns-api',
  version: '1.0.0'
};
