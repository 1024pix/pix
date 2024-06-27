import Joi from 'joi';
import XRegExp from 'xregexp';

import { userVerification } from '../../../../lib/application/preHandlers/user-existence-verification.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { config } from '../../../shared/config.js';
import { AVAILABLE_LANGUAGES } from '../../../shared/domain/services/language-service.js';
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
    method: 'GET',
    path: '/api/users/me',
    config: {
      handler: (request, h) => userController.getCurrentUser(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l’utilisateur courant\n',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'GET',
    path: '/api/users/{id}/authentication-methods',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.getUserAuthenticationMethods(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Elle permet la récupération des noms des méthodes de connexion de l'utilisateur.",
      ],
      tags: ['identity-access-management', 'api', 'user', 'authentication-methods'],
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
  {
    method: 'PATCH',
    path: '/api/users/{id}/pix-terms-of-service-acceptance',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.acceptPixLastTermsOfService(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur a accepté les dernières Conditions Générales d'Utilisation de Pix App\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/pix-orga-terms-of-service-acceptance',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.acceptPixOrgaTermsOfService(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur a accepté les Conditions Générales d'Utilisation de Pix Orga\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/pix-certif-terms-of-service-acceptance',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.acceptPixCertifTermsOfService(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur a accepté les Conditions Générales d'Utilisation de Pix Certif\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/lang/{lang}',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
          lang: Joi.string().valid(...AVAILABLE_LANGUAGES),
        }),
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.changeUserLanguage(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Modifie la langue de l'utilisateur\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- La lang contient les deux lettres de la langue choisie.',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/has-seen-last-data-protection-policy-information',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.rememberUserHasSeenLastDataProtectionPolicyInformation(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur ait vu la nouvelle politique de confidentialité Pix" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
];
