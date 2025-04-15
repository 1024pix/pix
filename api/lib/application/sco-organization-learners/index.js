import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import XRegExp from 'xregexp';

import {
  BadRequestError,
  sendJsonApiError,
  UnprocessableEntityError,
} from '../../../src/shared/application/http-errors.js';
import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { config } from '../../../src/shared/config.js';
import { identifiersType, studentIdentifierType } from '../../../src/shared/domain/types/identifiers-type.js';
import { scoOrganizationLearnerController } from './sco-organization-learner-controller.js';

const { passwordValidationPattern } = config.account;

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/sco-organization-learners/possibilities',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.generateUsername,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est inscrit à ' +
            "l'organisation détenant la campagne. Cet élève n'est, de plus, pas encore associé à l'organisation.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/dependent',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
                'with-username': Joi.boolean().required(),
                username: Joi.string().pattern(XRegExp('^([a-z]+[.]+[a-z]+[0-9]{4})$')).allow(null),
              },
            },
          }),
        },
        notes: [
          "Cette route crée un utilisateur et l'associe à l'élève trouvé au sein de l'organisation à laquelle " +
            'appartient la campagne spécifiée',
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/password-update',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
            assign: 'belongsToScoOrganizationAndManageStudents',
          },
        ],
        handler: scoOrganizationLearnerController.updatePassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': identifiersType.campaignId,
                'organization-learner-id': identifiersType.organizationLearnerId,
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(
              new BadRequestError('The server could not understand the request due to invalid syntax.'),
              h,
            );
          },
        },
        notes: [
          "- Met à jour le mot de passe d'un utilisateur identifié par son identifiant élève\n" +
            "- La demande de modification du mot de passe doit être effectuée par un membre de l'organisation à laquelle appartient l'élève.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/batch-username-password-generate',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
            assign: 'belongsToScoOrganizationAndManageStudents',
          },
        ],
        handler: scoOrganizationLearnerController.batchGenerateOrganizationLearnersUsernameWithTemporaryPassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': identifiersType.campaignId,
                'organization-learners-id': Joi.array().items(identifiersType.organizationLearnerId),
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(
              new BadRequestError('The server could not understand the request due to invalid syntax.'),
              h,
            );
          },
        },
        notes: [
          '- Génère les identifiants et les mots de passe à usage unique des élèves dont les identifiants sont passés en paramètre dans un fichier CSV\n' +
            "- La demande de génération doit être effectuée par un membre de l'organisation à laquelle appartiennent les élèves.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/username-password-generation',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
            assign: 'belongsToScoOrganizationAndManageStudents',
          },
        ],
        handler: scoOrganizationLearnerController.generateUsernameWithTemporaryPassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': identifiersType.organizationId,
                'organization-learner-id': identifiersType.organizationLearnerId,
              },
            },
          }),
        },
        notes: [
          "- Génère un identifiant pour l'élève avec un mot de passe temporaire \n" +
            "- La demande de génération d'identifiant doit être effectuée par un membre de l'organisation à laquelle appartient l'élève.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/account-recovery',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.checkScoAccountRecovery,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'ine-ina': studentIdentifierType,
                birthdate: Joi.date().format('YYYY-MM-DD').required(),
              },
            },
          }).options({ allowUnknown: true }),
        },
        notes: [
          "- Recherche d'un ancien élève par son ine/ina, prénom, nom, date de naissance \n" +
            '- On renvoie les informations permettant de récupérer son compte Pix.',
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
  ]);
};

const name = 'sco-organization-learners-api';
export { name, register };
