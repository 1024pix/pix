import Joi from 'joi';

import { identifiersType } from '../../domain/types/identifiers-type.js';
import { userSettingsController } from './user-settings-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/user-settings/{userId}',
      config: {
        handler: userSettingsController.getUserSettings,
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
          }),
        },
        tags: ['api', 'user-settings'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Retourne les paramètres de l'utilisateur passé en paramètre \n",
        ],
      },
    },
    {
      method: 'PUT',
      path: '/api/user-settings',
      config: {
        handler: userSettingsController.updateUserColor,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                color: Joi.string(),
              }),
            }),
          }),
        },
        tags: ['api', 'user-settings'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Mise à jour de la couleur de préférence par l‘utilisateur courant\n',
        ],
      },
    },
  ]);
};

const name = 'user-settings';
export { register, name };
