import Joi from 'joi';

import { responseObjectErrorDoc } from '../../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { certificationsResultsDoc } from '../infrastructure/open-api-doc/livret-scolaire/certifications-results-doc.js';
import { livretScolaireController } from './livret-scolaire-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{uai}/certifications',
      config: {
        auth: 'jwt-livret-scolaire',
        handler: livretScolaireController.getCertificationsByOrganizationUAI,
        notes: [
          '- **API for LSU/LSL qui nécessite une authentification de type client credential grant**\n' +
            '- Récupération des résultats de certifications pour une organisation. Les résultats sont accompagnés du référentiel des compétences',
        ],
        response: {
          failAction: 'log',
          status: {
            200: certificationsResultsDoc,
            204: certificationsResultsDoc,
            403: responseObjectErrorDoc,
          },
        },
        validate: {
          params: Joi.object({
            uai: Joi.string()
              .required()
              .description(
                'UAI/RNE (Unité Administrative Immatriculée anciennement Répertoire National des Établissements) ',
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

const name = 'livret-scolaire-api';
export { name, register };
