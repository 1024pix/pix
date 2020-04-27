const Joi = require('@hapi/joi');
const userOrgaSettingsController = require('./user-orga-settings-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/user-orga-settings/{id}',
      config: {
        handler: userOrgaSettingsController.update,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              relationships: {
                organization: {
                  data: {
                    id: Joi.number().integer().required(),
                  }
                }
              }
            }
          })
        },
        notes: [
          '- **Cette route est dépréciée**\n' +
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Mise à jour des paramètres utilisateurs liés à Pix Orga\n' +
          '- L’id dans le payload doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user-orga-settings']
      }
    },
    {
      method: 'PUT',
      path: '/api/user-orga-settings/{id}',
      config: {
        handler: userOrgaSettingsController.createOrUpdate,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              relationships: {
                organization: {
                  data: {
                    id: Joi.number().integer().required(),
                  }
                }
              }
            }
          })
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création ou Mise à jour des paramètres utilisateurs liés à Pix Orga\n' +
          '- L’id en paramètre doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user-orga-settings']
      }
    }
  ]);
};

exports.name = 'user-orga-settings-api';
