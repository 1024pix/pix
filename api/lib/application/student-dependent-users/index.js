const schoolingRegistrationDependentUserController = require('./../schooling-registration-dependent-users/schooling-registration-dependent-user-controller');
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { passwordValidationPattern } = require('../../config').account;
const XRegExp = require('xregexp');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/student-dependent-users',
      config: {
        auth: false,
        handler: schoolingRegistrationDependentUserController.createAndAssociateUserToSchoolingRegistration,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'birthdate': Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
                'with-username': Joi.boolean().required(),
              },
            },
          })
        },
        notes: [
          'Cette route crée un utilisateur et l\'associe à l\'inscription de l\'élève, celle-ci étant recherchée dans l\'organisation à laquelle ' +
          'appartient la campagne spécifiée' +
          '- L\'utilisation de cette route est dépréciée. Utiliser /api/schooling-registration-dependent-users à la place',
        ],
        tags: ['api', 'studentDependentUser']
      }
    }
  ]);
};

exports.name = 'student-dependent-users-api';
