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
    {
      method: 'GET',
      path: '/api/sessions/download-results/{token}',
      config: {
        auth: false,
        handler: certificationResultsController.getSessionResultsByRecipientEmail,
        tags: ['api', 'sessions', 'results'],
        notes: [
          "Cette route est accessible via un token envoyé par email lors de l'envoi automatique des résultats de certification",
          "Elle retourne les résultats de certifications d'une session agrégés par email de destinataire des résultats, sous format CSV",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/download-all-results/{token}',
      config: {
        auth: false,
        validate: {
          query: Joi.object({
            lang: Joi.string().optional().valid('fr', 'en'),
          }),
        },
        handler: certificationResultsController.getSessionResultsToDownload,
        tags: ['api', 'sessions', 'results'],
        notes: [
          'Cette route est accessible via un token généré par un utilisateur ayant le rôle SUPERADMIN',
          "Elle retourne tous les résultats de certifications d'une session, sous format CSV",
        ],
      },
    },
  ]);
};

const name = 'certification-results-api';
export { name, register };
