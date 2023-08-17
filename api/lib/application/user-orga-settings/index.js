import Joi from 'joi';

import { identifiersType } from '../../domain/types/identifiers-type.js';
import { userOrgaSettingsController } from './user-orga-settings-controller.js';

const register = async function (server) {
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
            id: identifiersType.userId,
          }),
          payload: Joi.object({
            data: {
              relationships: {
                organization: {
                  data: {
                    id: identifiersType.organizationId,
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

const name = 'user-orga-settings-api';
export { name, register };
