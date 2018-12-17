const QmailController = require('./qmail-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/qmail',
      config: { handler: QmailController.validate, tags: ['api'] }
    }
  ]);
};

exports.name = 'qmail-api';
