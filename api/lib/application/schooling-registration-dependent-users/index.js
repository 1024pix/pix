const schoolingRegistrationDependentUserController = require('./schooling-registration-dependent-user-controller');
const securityPreHandlers = require('../security-pre-handlers');
const JSONAPIError = require('jsonapi-serializer').Error;
const Joi = require('@hapi/joi');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users',
      config: {
        auth: false,
        handler: schoolingRegistrationDependentUserController.createAndAssociateUserToSchoolingRegistration,
        notes: [
          'Cette route crée un utilisateur et l\'associe à l\'élève trouvé au sein de l\'organisation à laquelle ' +
          'appartient la campagne spécifiée'
        ],
        tags: ['api', 'schoolingRegistrationDependentUser']
      }
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users/password-update',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents'
        }],
        handler: schoolingRegistrationDependentUserController.updatePassword,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': Joi.number().required(),
                'schooling-registration-id': Joi.number().required()
              }
            }
          }),
          failAction: (request, h) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          }
        },
        notes : [
          '- Met à jour le mot de passe d\'un utilisateur identifié par son identifiant élève\n' +
          '- La demande de modification du mot de passe doit être effectuée par un membre de l\'organisation à laquelle appartient l\'élève.'
        ],
        tags: ['api', 'schoolingRegistrationDependentUser'],
      }
    },
  ]);
};

exports.name = 'schooling-registration-dependent-users-api';
