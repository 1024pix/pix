import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { attestationController } from './attestation-controller.js';

const register = async function (server) {
  const userRoutes = [
    {
      method: 'GET',
      path: '/api/users/{userId}/attestations/{attestationKey}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            attestationKey: Joi.string(),
          }),
        },
        handler: attestationController.getUserAttestation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération de l'attestation utilisateur" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'profile'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{userId}/attestation-details',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
          }),
        },
        handler: attestationController.getUserAttestationsDetails,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération de la liste des attestations disponible' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'attestations', 'profile'],
      },
    },
  ];

  server.route([...userRoutes]);
};

const name = 'attestation-api';
export { name, register };
