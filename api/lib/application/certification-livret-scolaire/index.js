const certificationController = require('./certification-controller.js');
const Joi = require('joi');

const responseErrorObjectDoc = require('../../infrastructure/open-api-doc/livret-scolaire/response-object-error-doc.js');
const certificationsResultsResponseDoc = require('../../infrastructure/open-api-doc/livret-scolaire/certifications-results-doc.js');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{uai}/certifications',
      config: {
        auth: 'jwt-livret-scolaire',
        handler: certificationController.getCertificationsByOrganizationUAI,
        notes: [
          '- **API for LSU/LSL qui nécessite une authentification de type client credential grant**\n' +
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
            uai: Joi.string()
              .required()
              .description(
                'UAI/RNE (Unité Administrative Immatriculée anciennement Répertoire National des Établissements) '
              ),
          }),
          headers: Joi.object({
            authorization: Joi.string().description('Bearer Access token to access to API '),
          }).unknown(),
        },
        tags: ['api', 'organisation', 'livret-scolaire'],
      },
    },
  ]);
};

exports.name = 'certifications-lsu-lsl-api';
