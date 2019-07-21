const securityController = require('../../interfaces/controllers/security-controller');
const sessionController = require('./session-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: sessionController.find,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de consulter la liste de toutes les sessions (retourne un tableau avec n éléments)',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}',
      config: {
        auth: false,
        handler: sessionController.get,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}/attendance-sheet',
      config: {
        auth: false,
        handler: sessionController.getAttendanceSheet,
        tags: ['api'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
          '- Cette route permet de télécharger le pv de session pré-rempli au format ods'
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/sessions',
      config: {
        handler: sessionController.save,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle permet de créer une session de certification liée au centre de certification de l’utilisateur',
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/sessions/{id}/certification-candidates/parse-from-attendance-sheet',
      config: {
        payload: {
          allow: 'multipart/form-data',
        },
        handler: sessionController.parseCertificationCandidatesFromAttendanceSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et appartenant à un centre de certification ayant créé la session**\n' +
          '- Elle permet de récupérer la liste des candidats à inscrire contenue dans le fichier ODS envoyé ainsi qu\'un compte-rendu de vérification de fichier',
        ]
      }
    },
    {
      method: 'PATCH',
      path: '/api/sessions/{id}',
      config: {
        handler: sessionController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Modification d\'une session de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la session à modifier',
        ],
        tags: ['api', 'session']
      }
    },
  ]);
};

exports.name = 'sessions-api';
