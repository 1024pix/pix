import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { targetProfileController } from './target-profile-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
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
      path: '/api/frameworks/for-target-profile-submission',
      config: {
        handler: targetProfileController.getFrameworksForTargetProfileSubmission,
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfAnOrganization,
            assign: 'checkUserIsMemberOfAnOrganization',
          },
        ],
        tags: ['api', 'framework'],
        notes: [
          "Cette route est restreinte aux utilisateurs authentifiés membre d'une organisation",
          'Elle permet de récupérer tous le contenu pédagogique à disposition pour formuler une demande de création de profil cible',
        ],
      },
    },
  ]);
};

const name = 'orga-target-profiles-api';
export { name, register };
