import Joi from 'joi';
import XRegExp from 'xregexp';

import { userVerification } from '../../../../lib/application/preHandlers/user-existence-verification.js';
import { config } from '../../../shared/config.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user.controller.js';

const { passwordValidationPattern } = config.account;

export const userRoutes = [
  {
    method: 'POST',
    path: '/api/users',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            type: Joi.string(),
            attributes: Joi.object().required(),
            relationships: Joi.object(),
          }).required(),
          meta: Joi.object(),
        }).required(),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userController.save(request, h),
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/password-update',
    config: {
      auth: false,
      pre: [
        {
          method: (request, h) => userVerification.verifyById(request, h),
          assign: 'user',
        },
      ],
      handler: (request, h) => userController.updatePassword(request, h),
      validate: {
        options: {
          allowUnknown: true,
        },
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
            },
          },
        }),
      },
      notes: [
        "- Met à jour le mot de passe d'un utilisateur identifié par son id\n" +
          "- Une clé d'identification temporaire permet de vérifier l'identité du demandeur",
      ],
      tags: ['identity-access-managements', 'api', 'user'],
    },
  },
];
