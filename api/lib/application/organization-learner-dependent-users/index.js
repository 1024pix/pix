const Joi = require('joi').extend(require('@joi/date'));

const securityPreHandlers = require('../security-pre-handlers');
const identifiersType = require('../../domain/types/identifiers-type');

const inePattern = new RegExp('^[0-9]{9}[a-zA-Z]{2}$');
const inaPattern = new RegExp('^[0-9]{10}[a-zA-Z]{1}$');

const organizationLearnerDependentUserController = require('./organization-learner-dependent-user-controller');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users/generate-username-password',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
            assign: 'belongsToScoOrganizationAndManageStudents',
          },
        ],
        handler: organizationLearnerDependentUserController.generateUsernameWithTemporaryPassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': identifiersType.organizationId,
                'schooling-registration-id': identifiersType.schoolingRegistrationId,
              },
            },
          }),
        },
        notes: [
          "- Génère un identifiant pour l'élève avec un mot de passe temporaire \n" +
            "- La demande de génération d'identifiant doit être effectuée par un membre de l'organisation à laquelle appartient l'élève.",
        ],
        tags: ['api', 'organizationLearnerDependentUser', 'username'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users/recover-account',
      config: {
        auth: false,
        handler: organizationLearnerDependentUserController.checkScoAccountRecovery,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'ine-ina': Joi.alternatives().try(
                  Joi.string().regex(inePattern).required(),
                  Joi.string().regex(inaPattern).required()
                ),
                birthdate: Joi.date().format('YYYY-MM-DD').required(),
              },
            },
          }).options({ allowUnknown: true }),
        },
        notes: [
          "- Recherche d'un ancien élève par son ine/ina, prénom, nom, date de naissance \n" +
            '- On renvoie les informations permettant de récupérer son compte Pix.',
        ],
        tags: ['api', 'organizationLearnerDependentUser', 'recovery'],
      },
    },
  ]);
};

exports.name = 'organization-learner-dependent-users-api';
