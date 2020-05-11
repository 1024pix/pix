const securityController = require('../security-controller');
const certificationCourseController = require('./certification-course-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}/details',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: certificationCourseController.computeResult,
        tags: ['api'],
        notes: [
          'Cette route est utilisé par Pix Admin',
          'Elle sert au cas où une certification a eu une erreur de calcul',
          'Cette route ne renvoie pas le bon format.',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: certificationCourseController.getResult,
        tags: ['api']
      }
    },
    {
      method: 'PATCH',
      path: '/api/certification-courses/{id}',
      config: {
        handler: certificationCourseController.update,
        tags: ['api']
      }
    }, {
      method: 'POST',
      path: '/api/certification-courses',
      config: {
        handler: certificationCourseController.save,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- S\'il existe déjà une certification pour l\'utilisateur courant dans cette session, alors cette route renvoie la certification existante avec un code 200\n' +
          '- Sinon, crée une certification pour l\'utilisateur courant dans la session indiquée par l\'attribut *access-code*, et la renvoie avec un code 201\n'
        ],
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/certification-courses/{id}',
      config: {
        handler: certificationCourseController.get,
        tags: ['api']
      }
    },
  ]);
};

exports.name = 'certification-courses-api';
