import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { scoOrganizationLearnerController } from './sco-organization-learner.controller.js';

export const scoOrganizationLearnerRoutes = [
  {
    method: 'POST',
    path: '/api/sco-organization-learners/generate-usernames',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents',
        },
      ],
      handler: (request, h) => scoOrganizationLearnerController.generateUsernamesFile(request, h),
      validate: {
        options: {
          allowUnknown: true,
        },
        payload: Joi.object({
          data: {
            attributes: {
              'organization-id': identifiersType.organizationId,
              'organization-learner-ids': Joi.array().items(identifiersType.organizationLearnerId),
            },
          },
        }),
      },
      notes: [
        '- Génère un identifiant pour les élèves avec un mot de passe temporaire \n' +
          "- La demande de génération d'identifiant doit être effectuée par un membre de l'organisation à laquelle appartiennent les élèves.",
      ],
      tags: ['api', 'sco-organization-learners'],
    },
  },
];
