const QmailController = require('./qmail-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/qmail',
      config: { handler: QmailController.validate, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'qmail-api',
  version: '1.0.0'
};
