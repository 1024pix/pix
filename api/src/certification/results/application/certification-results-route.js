import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ENGLISH_SPOKEN, FRENCH_SPOKEN } from '../../../shared/domain/services/locale-service.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { certificationResultsController } from './certification-results-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}/certified-profile',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationResultsController.getCertifiedProfile,
        tags: ['api'],
        notes: [
          'Cette route est utilisé par Pix Admin',
          'Elle permet de récupérer le profil certifié pour une certification donnée',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/{sessionId}/certified-clea-candidate-data',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
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
      method: 'POST',
      path: '/api/sessions/download-all-results',
      config: {
        auth: false,
        validate: {
          query: Joi.object({
            lang: Joi.string().optional().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
          payload: Joi.object({
            token: Joi.string().required(),
          }),
        },
        handler: certificationResultsController.postSessionResultsToDownload,
        tags: ['api', 'sessions', 'results'],
        notes: [
          'Cette route est accessible via un token généré par un utilisateur ayant le rôle SUPERADMIN',
          "Elle retourne tous les résultats de certifications d'une session, sous format CSV",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/{sessionId}/generate-results-download-link',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
          query: Joi.object({
            lang: Joi.string().optional().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationResultsController.generateSessionResultsDownloadLink,
        tags: ['api', 'sessions', 'results'],
        notes: [
          "Cette route est restreinte aux utilisateurs ayant les droits d'accès",
          "Elle permet de générer un lien permettant de télécharger tous les résultats de certification d'une session",
        ],
      },
    },
  ]);
};

const name = 'certification-results-api';
export { name, register };
