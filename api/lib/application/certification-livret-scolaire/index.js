const certificationController = require('./certification-controller');
const { featureToggles } = require('../../config');
const Joi = require('@hapi/joi');

const responseErrorObjectDoc = require('../../infrastructure/open-api-doc/livret-scolaire/response-object-error-doc');
const certificationsResultsResponseDoc = require('../../infrastructure/open-api-doc/livret-scolaire/certifications-results-doc');

exports.register = async function(server) {

  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{uai}/certifications',
      config: {
        auth: (featureToggles.isLivretScolaireSandboxApiEnabled) ? false : undefined,
        handler: certificationController.getCertificationsByOrganizationUAI,
        notes: [
          '- **API for LSU/LSL qui nécessite une authentification de type client credentiel grant**\n' +
          '- Récupération des résultats de certifications pour une organisation. Les résultats sont accompagnés du référentiel des compétences',
        ],
        response: {
          failAction: 'log',
          status: {
            200: certificationsResultsResponseDoc,
            204: certificationsResultsResponseDoc,
            403: responseErrorObjectDoc,
          },
        },
        validate: {
          params: Joi.object({
            uai: Joi.string().required().description('UAI/RNE (Unité Administrative Immatriculée anciennement Répertoire National des Établissements) '),
          }),
        },
        tags: ['api', 'organisation', 'livret-scolaire'],
      },
    },
  ]);
};

exports.name = 'certifications-lsu-lsl-api';
