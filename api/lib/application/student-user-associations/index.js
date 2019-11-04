const studentUserAssociationController = require('./student-user-association-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/student-user-associations',
      config: {
        handler: studentUserAssociationController.associate,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle associe des données de l’utilisateur qui fait la requete, au student de l’organisation'
        ],
        tags: ['api', 'studentUserAssociation']
      }
    },
  ]);
};

exports.name = 'student-user-associations-api';
