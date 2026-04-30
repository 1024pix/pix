import Joi from 'joi';
import XRegExp from 'xregexp';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { config } from '../../../shared/config.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';
import * as localeService from '../../../shared/domain/services/locale-service.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user.controller.js';
import { userVerification } from './user-existence-verification-pre-handler.js';

const { passwordValidationPattern } = config.account;

export const userRoutes = [
  {
    method: 'PUT',
    path: '/api/users/{id}/email/verification-code',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            type: Joi.string().valid('email-verification-codes').required(),
            attributes: {
              action: Joi.string().valid('add-email', 'update-email').optional(),
              'new-email': Joi.string().email().required(),
              password: Joi.string().required(),
            },
          },
        }),
        failAction: (request, h, error) => {
          return EntityValidationError.fromJoiErrors(error.details);
        },
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.sendVerificationCode(request, h),
      notes: ["Permet à un utilisateur de recevoir un code de vérification lors de l'ajout ou modification d'email."],
      tags: ['api', 'user', 'verification-code'],
    },
  },

  {
    method: 'POST',
    path: '/api/users',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            type: Joi.string(),
            attributes: Joi.object({
              'first-name': Joi.string().required(),
              'last-name': Joi.string().required(),
              lang: Joi.string().valid(...localeService.getSupportedLanguages()),
              locale: Joi.string()
                .valid(...localeService.getSupportedLocales())
                .allow(null),
              email: Joi.string().allow(null),
              username: Joi.string().allow(null),
              password: Joi.string().allow(null),
              cgu: Joi.boolean().allow(null),
              'anonymous-user-token': Joi.string().optional(), // TODO: Remove 2 weeks after the fronts have been updated in production
              'is-anonymous': Joi.boolean().allow(null),
              'must-validate-terms-of-service': Joi.boolean().allow(null),
              'code-for-last-profile-to-share': Joi.string().allow(null),
              'email-confirmed': Joi.boolean().allow(null),
              'has-assessment-participations': Joi.boolean().allow(null),
              'has-recommended-trainings': Joi.boolean().allow(null),
              'has-seen-assessment-instructions': Joi.boolean().allow(null),
              'has-seen-focused-challenge-tooltip': Joi.boolean().allow(null),
              'has-seen-new-dashboard-info': Joi.boolean().allow(null),
              'has-seen-other-challenges-tooltip': Joi.boolean().allow(null),
              'should-see-data-protection-policy-information-banner': Joi.boolean().allow(null),
              'pix-orga-terms-of-service-status': Joi.boolean().allow(null), // sent by Pix Orga when creating a user upon invitation
            }).required(),
            relationships: Joi.object(),
          }).required(),
          meta: Joi.object(),
        }).required(),
      },
      handler: (request, h) => userController.createUser(request, h),
      notes: ['- **Cette route est publique**\n' + '- Crée un compte utilisateur'],
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
    method: 'DELETE',
    path: '/api/users/me',
    config: {
      handler: (request, h) => userController.selfDeleteUserAccount(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Permet à l’utilisateur authentifié de supprimer son compte',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'GET',
    path: '/api/users/my-account',
    config: {
      handler: (request, h) => userController.getCurrentUserAccountInfo(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des informations du compte utilisateur authentifié\n',
      ],
      tags: ['identity-access-management', 'api', 'user', 'my-account'],
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
    path: '/api/users/{id}', // TODO: Rename this route to reflect it's only for upgradeToRealUser
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
        payload: Joi.object({
          data: Joi.object({
            id: identifiersType.userId.required(),
            type: Joi.string().required(),
            attributes: Joi.object({
              'first-name': Joi.string().required(),
              'last-name': Joi.string().required(),
              email: Joi.string().required(),
              password: Joi.string().required(),
              cgu: Joi.boolean().required(),
              'anonymous-user-token': Joi.string().optional(), // TODO: Remove 2 weeks after the fronts have been updated in production
              // TODO: attributes bellow should not be sent, they are not used.
              username: Joi.string().allow(null),
              lang: Joi.string().valid(...localeService.getSupportedLanguages()),
              locale: Joi.string()
                .valid(...localeService.getSupportedLocales())
                .allow(null),
              'is-anonymous': Joi.boolean().allow(null),
              'must-validate-terms-of-service': Joi.boolean().allow(null),
              'code-for-last-profile-to-share': Joi.string().allow(null),
              'email-confirmed': Joi.boolean().allow(null),
              'has-assessment-participations': Joi.boolean().allow(null),
              'has-recommended-trainings': Joi.boolean().allow(null),
              'has-seen-assessment-instructions': Joi.boolean().allow(null),
              'has-seen-focused-challenge-tooltip': Joi.boolean().allow(null),
              'has-seen-new-dashboard-info': Joi.boolean().allow(null),
              'has-seen-other-challenges-tooltip': Joi.boolean().allow(null),
              'should-see-data-protection-policy-information-banner': Joi.boolean().allow(null),
              'last-terms-of-service-validated-at': Joi.string().allow(null),
              'last-data-protection-policy-seen-at': Joi.string().allow(null),
            }).required(),
          }).required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userController.upgradeToRealUser(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs anonymes**\n' +
          "- Crée un compte Pix en conservant les points et l'id de l'utilisateur anonyme" +
          '- L’id demandé doit correspondre à celui de l’utilisateur à enrichir',
      ],
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
          lang: Joi.string().valid(...localeService.getSupportedLocales()),
        }),
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.changeUserLocale(request, h),
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
  {
    method: 'GET',
    path: '/api/users/validate-email',
    config: {
      auth: false,
      validate: {
        query: Joi.object({
          token: Joi.string().uuid().optional(),
          redirect_url: Joi.string()
            .uri({ scheme: ['https'] })
            .optional(),
        }),
      },
      handler: (request, h) => userController.validateUserAccountEmail(request, h),
      notes: [
        '- **Cette route est publique**\n' +
          "- Valide l'email du compte utilisateur puis le redirige vers la redirect_url\n" +
          '- Le token de validation en paramètre doit correspondre à celui de l’utilisateur',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'POST',
    path: '/api/users/{id}/update-email',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: userController.updateUserEmailWithValidation,
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        options: {
          allowUnknown: true,
        },
        payload: Joi.object({
          data: {
            type: Joi.string().valid('email-verification-codes').required(),
            attributes: {
              code: Joi.string()
                .regex(/^[1-9]{6}$/)
                .required(),
            },
          },
        }),
        failAction: (request, h, error) => {
          return EntityValidationError.fromJoiErrors(error.details);
        },
      },
      notes: [
        "- Suite à une demande de changement d'adresse e-mail, met à jour cette dernière pour l'utilisateur identifié par son id.",
      ],
      tags: ['api', 'user', 'update-email'],
    },
  },
  {
    method: 'POST',
    path: '/api/users/{id}/add-email-connection-method',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: userController.addUserEmailWithValidation,
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            type: Joi.string().valid('email-verification-codes').required(),
            attributes: {
              code: Joi.string()
                .regex(/^[1-9]{6}$/)
                .required(),
            },
          },
        }),
        failAction: (request, h, error) => {
          return EntityValidationError.fromJoiErrors(error.details);
        },
      },
      notes: ["- Ajoute une méthode de connexion par adresse email à la suite d'une demande de l'utilisateur"],
      tags: ['api', 'user', 'add-email'],
    },
  },
  {
    method: 'GET',
    path: '/api/certification-point-of-contacts/me',
    config: {
      handler: (request, h) => userController.getCertificationPointOfContact(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés*' * '\n' +
          '- Récupération d’un référent de certification.',
      ],
      tags: ['api', 'identity-access-management', 'user', 'certification', 'certification-point-of-contact'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/has-seen-challenge-tooltip/{challengeType}',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
          challengeType: Joi.string().valid('focused', 'other'),
        }),
      },
      handler: userController.rememberUserHasSeenChallengeTooltip,
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur ait vu la tooltip de type d'épreuve" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['api', 'user'],
    },
  },
];
