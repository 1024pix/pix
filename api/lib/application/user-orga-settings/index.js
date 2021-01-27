const Joi = require('joi');

const userOrgaSettingsController = require('./user-orga-settings-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/user-orga-settings/{id}',
      config: {
        handler: userOrgaSettingsController.createOrUpdate,
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            id: identifiersType.userOrgaSettingsId,
          }),
          payload: Joi.object({
            data: {
              relationships: {
                organization: {
                  data: {
                    id: Joi.number().integer().required(),
                  },
                },
              },
            },
          }),
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création ou Mise à jour des paramètres utilisateurs liés à Pix Orga\n' +
          '- L’id en paramètre doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user-orga-settings'],
      },
    },
  ]);
};

exports.name = 'user-orga-settings-api';
