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
          '- Récupération des résultats de certifications pour une organisation accompagnée du référentiel des compétences',
        ],
        tags: ['api', 'organisation', 'livret-scolaire'],
        response: {
          status: {
            200: certificationsResultsResponseDoc,
            401: responseErrorObjectDoc,
            403: responseErrorObjectDoc,
          },
          schema: certificationsResultsResponseDoc,
        },
        validate: {
          params: Joi.object({
            uai: Joi.string().required().description('RNE/UAI (Unité Administrative Immatriculée du Répertoire National des Établissements) '),
          }),
          headers: Joi.object({
            'authorization': Joi.string().required().description('Bearer Access token to access to API '),
          }).unknown(),
        },
      },
    },
  ]);
};

exports.name = 'certifications-lsu-lsl-api';
