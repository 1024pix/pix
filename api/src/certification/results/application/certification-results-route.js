import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { certificationResultsController } from './certification-results-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/certified-clea-candidate-data',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationResultsController.getCleaCertifiedCandidateDataCsv,
        tags: ['api', 'sessions', 'export-csv'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne toutes les infos des candidats d'une session ayant obtenu la certification Clea, sous format CSV",
        ],
      },
    },
  ]);
};

const name = 'certification-results-api';
export { name, register };
