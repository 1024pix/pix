const schoolingRegistrationDependentUserController = require('./../schooling-registration-dependent-users/schooling-registration-dependent-user-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/student-dependent-users',
      config: {
        auth: false,
        handler: schoolingRegistrationDependentUserController.createAndAssociateUserToSchoolingRegistration,
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
