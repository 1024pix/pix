import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationLearnersController } from './organization-learners-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/attestations/{attestationKey}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
            attestationKey: Joi.string(),
          }),
          query: Joi.object({
            divisions: Joi.array().items(Joi.string()).default([]),
          }),
        },
        handler: organizationLearnersController.getAttestationZipForDivisions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Génération d'un zip d'attestations pour une liste de classes d'une organisation" +
            "- L'utisateur doit être au moins membre de l'organisation'",
        ],
        tags: ['api', 'organization', 'attestations'],
      },
    },
  ]);
};

const name = 'organization-learners-route';
export { name, register };
