import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { targetProfilePreHandlers } from './pre-handlers.js';
import { targetProfileController } from './target-profile-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/target-profiles',
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
          }),
        },
        handler: targetProfileController.findTargetProfiles,
        tags: ['api', 'target-profile'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des profiles cibles utilisables par l‘organisation\n',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/frameworks',
      config: {
        handler: targetProfileController.findLearningContentsByOrganizationId,
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        tags: ['api', 'framework'],
        notes: [
          "Cette route est restreinte aux utilisateurs authentifiés membre d'une organisation",
          'Elle permet de récupérer tous les référentiel à disposition pour formuler une demande de création de profil cible',
        ],
      },
    },
  ]);
};

const name = 'prescription/target-profile/target-profile-api';
export { name, register };
