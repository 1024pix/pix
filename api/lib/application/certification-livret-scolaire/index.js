const certificationController = require('./certification-controller');
const { featureToggles } = require('../../config');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{uai}/certifications',
      config: {
        auth: (featureToggles.isLivretScolaireSandboxApiEnabled) ? false : undefined,
        handler: certificationController.getCertificationsByOrganizationUAI,
        notes: [
          '- **Route en version v0 sans authentification**\n' +
          '- Récupération des résultats de certifications pour une organisation accompagnée du référentiel des compétences',
        ],
        tags: ['api', 'organisation', 'certifications'],
      },
    },
  ]);
};

exports.name = 'certifications-lsu-lsl-api';
