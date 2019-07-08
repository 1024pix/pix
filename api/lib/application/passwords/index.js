const passwordController = require('./password-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/password-reset-demands',
      config: {
        auth: false,
        handler: passwordController.createPasswordResetDemand,
        notes: [
          'Route publique',
          'Créer une demande de réinitialisation de mot de passe',
        ],
        tags: ['api', 'passwords']
      }
    },
    {
      method: 'POST',
      path: '/api/password-resets',
      config: {
        auth: false,
        handler: passwordController.createPasswordReset,
        notes: [
          'Route publique',
          'Créer une réinitialisation de mot de passe',
        ],
        tags: ['api', 'passwords']
      }
    }
  ]);
};

exports.name = 'passwords-api';
