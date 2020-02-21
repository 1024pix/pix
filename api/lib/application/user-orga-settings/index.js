const Joi = require('@hapi/joi');
const userOrgaSettingsController = require('./user-orga-settings-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/user-orga-settings',
      config: {
        handler: userOrgaSettingsController.create,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              relationships: {
                organization: {
                  data: {
                    id: Joi.number().required(),
                  }
                },
                user: {
                  data: {
                    id: Joi.number().required()
                  }
                }
              }
            }
          })
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création des paramètres utilisateurs liées à Pix Orga\n' +
          '- L’id dans le payload doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user-orga-settings']
      }
    }
  ]);
};

exports.name = 'user-orga-settings-api';
