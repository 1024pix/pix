const studentDependentUserController = require('./student-dependent-user-controller');
const securityController = require('../../interfaces/controllers/security-controller');
const Joi = require('@hapi/joi');
const { passwordValidationPattern } = require('../../config').account;
const XRegExp = require('xregexp');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/student-dependent-users',
      config: {
        auth: false,
        handler: studentDependentUserController.createAndAssociateUserToStudent,
        notes: [
          'Cette route crée un utilisateur et l\'associe à l\'élève trouvé au sein de l\'organisation à laquelle ' +
          'appartient la campagne spécifiée'
        ],
        tags: ['api', 'studentDependentUser']
      }
    },
    {
      method: 'POST',
      path: '/api/student-dependent-users/password-update',
      config: {
        pre: [{
          method: securityController.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents'
        }],
        handler: studentDependentUserController.updatePassword,
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
        tags: ['api', 'studentDependentUser'],
      }
    },
  ]);
};

exports.name = 'student-dependent-users-api';
