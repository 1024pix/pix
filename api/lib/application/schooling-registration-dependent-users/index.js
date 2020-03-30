const schoolingRegistrationDependentUserController = require('./schooling-registration-dependent-user-controller');
const securityController = require('../../interfaces/controllers/security-controller');
const Joi = require('@hapi/joi');
const { passwordValidationPattern } = require('../../config').account;
const XRegExp = require('xregexp');

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
          method: securityController.checkUserBelongsToScoOrganizationAndManagesStudents,
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
                'student-id': Joi.number().required(),
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
              }
            }
          })
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
