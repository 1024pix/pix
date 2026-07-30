import Joi from 'joi';

import { securityPreHandlers as certifSecurityPrehandlers } from '../../../certification/shared/application/security-pre-handlers.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationCenterMembershipController } from './certification-center-membership.controller.js';

export const certificationCenterMembershipRoute = [
  {
    method: 'GET',
    path: '/api/certification-centers/{certificationCenterId}/members',
    config: {
      pre: [
        {
          method: certifSecurityPrehandlers.checkUserIsMemberOfCertificationCenter,
          assign: 'isMemberOfCertificationCenter',
        },
      ],
      validate: {
        params: Joi.object({
          certificationCenterId: identifiersType.certificationCenterId,
        }),
      },
      handler: (request, h) => certificationCenterMembershipController.findCertificationCenterMemberships(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n' +
          "- Récupération de tous les membres d'un centre de certification.\n",
      ],
      tags: ['api', 'team', 'certification-center', 'members'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/certification-centers/{certificationCenterId}/certification-center-memberships/{id}',
    config: {
      validate: {
        params: Joi.object({
          certificationCenterId: identifiersType.certificationCenterId,
          id: identifiersType.certificationCenterMembershipId,
        }),
      },
      handler: certificationCenterMembershipController.updateFromPixCertif,
      pre: [
        {
          method: certifSecurityPrehandlers.checkUserIsAdminOfCertificationCenter,
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      notes: [
        "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
          "- Modification du rôle d'un membre d'un centre de certification\n",
      ],
      tags: ['api', 'certification-center-membership'],
    },
  },
  {
    method: 'POST',
    path: '/api/certif/certification-centers/{certificationCenterId}/update-referer',
    config: {
      handler: certificationCenterMembershipController.updateReferer,
      pre: [
        {
          method: certifSecurityPrehandlers.checkUserIsAdminOfCertificationCenter,
          assign: 'isAdminOfCertificationCenter',
        },
      ],
      notes: [
        "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
          "- Mise à jour du status de référent d'un membre d'un espace pix-certif\n",
      ],
      tags: ['api', 'certification-center-membership'],
    },
  },
  {
    method: 'DELETE',
    path: '/api/certification-center-memberships/{certificationCenterMembershipId}',
    config: {
      validate: {
        params: Joi.object({
          certificationCenterMembershipId: identifiersType.certificationCenterMembershipId,
        }),
      },
      pre: [
        {
          method: certifSecurityPrehandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId,
        },
      ],
      handler: certificationCenterMembershipController.disableFromPixCertif,
      notes: [
        "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
          "- Suppression d'un membre d'un centre de certification\n",
      ],
      tags: ['api', 'certification-center-membership'],
    },
  },
  {
    method: 'POST',
    path: '/api/certification-center-memberships/{certificationCenterMembershipId}/access',
    config: {
      validate: {
        params: Joi.object({
          certificationCenterMembershipId: identifiersType.certificationCenterMembershipId,
        }),
      },
      handler: (request, h) => certificationCenterMembershipController.updateLastAccessedAt(request, h),
      tags: ['api', 'certification-center-membership'],
      notes: [
        "Cette route est restreinte aux membres authentifiés d'un centre de certification",
        'Elle permet de mettre à jour la dernière date d’accès d’un utilisateur à un centre de certification.',
      ],
    },
  },
];
