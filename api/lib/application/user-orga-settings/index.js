import Joi from 'joi';

import { securityPreHandlers } from '../security-pre-handlers.js';
import { userOrgaSettingsController } from './user-orga-settings-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/user-orga-settings/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
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
        handler: userOrgaSettingsController.createOrUpdate,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Création ou Mise à jour des paramètres utilisateurs liés à Pix Orga, permet notamment d’enregistrer les préférences d’un prescripteur vis à vis de son espace Orga.\n' +
            '- L’id en paramètre doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user-orga-settings'],
      },
    },
  ]);
};

const name = 'user-orga-settings-api';
export { register, name };
