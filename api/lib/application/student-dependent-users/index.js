const studentDependentUserController = require('./student-dependent-user-controller');

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
  ]);
};

exports.name = 'student-dependent-users-api';
