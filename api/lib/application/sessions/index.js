import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { authorization } from '../preHandlers/authorization.js';
import { finalizedSessionController } from './finalized-session-controller.js';
import { sessionController } from './session-controller.js';
import { sessionWithCleaCertifiedCandidateController } from './session-with-clea-certified-candidate-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/sessions',
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
        handler: sessionController.findPaginatedFilteredJurySessions,
        tags: ['api', 'sessions'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de consulter la liste de toutes les sessions avec filtre et pagination (retourne un tableau avec n éléments)',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
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
        handler: sessionController.getJurySession,
        tags: ['api', 'sessions'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/to-publish',
      config: {
        validate: {
          query: Joi.object({
            'filter[version]': Joi.number(),
          }),
        },
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
        handler: finalizedSessionController.findFinalizedSessionsToPublish,
        tags: ['api', 'finalized-sessions'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/with-required-action',
      config: {
        validate: {
          query: Joi.object({
            'filter[version]': Joi.number(),
          }),
        },
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
        handler: finalizedSessionController.findFinalizedSessionsWithRequiredAction,
        tags: ['api', 'finalized-sessions'],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}/candidates-import-sheet',
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
        handler: sessionController.getCandidatesImportSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
            "- Cette route permet de télécharger le template d'import des candidats d'une certification au format ods",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/sessions/{id}/certification-candidates/import',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        payload: {
          parse: 'gunzip',
          maxBytes: 1048576 * 10, // 10MB
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.importCertificationCandidatesFromCandidatesImportSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et appartenant à un centre de certification ayant créé la session**\n' +
            '- Elle permet de récupérer la liste des candidats à inscrire contenue dans le PV de session format ODS envoyé',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/{id}/jury-certification-summaries',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
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
        handler: sessionController.getJuryCertificationSummaries,
        tags: ['api', 'sessions', 'jury-certification-summary'],
        notes: [
          "Cette route est restreinte aux utilisateurs ayant les droits d'accès",
          "Elle retourne les résumés de certifications d'une session",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions/{id}/generate-results-download-link',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
          query: Joi.object({
            lang: Joi.string().optional().valid('fr', 'en'),
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
        handler: sessionController.generateSessionResultsDownloadLink,
        tags: ['api', 'sessions'],
        notes: [
          "Cette route est restreinte aux utilisateurs ayant les droits d'accès",
          "Elle permet de générer un lien permettant de télécharger tous les résultats de certification d'une session",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/download-results/{token}',
      config: {
        auth: false,
        handler: sessionController.getSessionResultsByRecipientEmail,
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
        handler: sessionController.getSessionResultsToDownload,
        tags: ['api', 'sessions', 'results'],
        notes: [
          'Cette route est accessible via un token généré par un utilisateur ayant le rôle SUPERADMIN',
          "Elle retourne tous les résultats de certifications d'une session, sous format CSV",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/sessions/{id}/candidate-participation',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        handler: sessionController.createCandidateParticipation,
        tags: ['api', 'sessions', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle associe un candidat de certification à une session\n' +
            "à un utilisateur à l'aide des informations d'identité de celui-ci (nom, prénom et date de naissance).",
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/sessions/{id}/publish',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
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
        handler: sessionController.publish,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Publie toutes les certifications courses d'une session",
        ],
        tags: ['api', 'session', 'publication'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/sessions/publish-in-batch',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                ids: Joi.array().items(identifiersType.sessionId),
              },
            },
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
        handler: sessionController.publishInBatch,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Permet de publier plusieurs sessions sans problème d'un coup",
        ],
        tags: ['api', 'session', 'publication'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/sessions/{id}/unpublish',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
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
        handler: sessionController.unpublish,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Dépublie toutes les certifications courses d'une session",
        ],
        tags: ['api', 'session', 'publication'],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/sessions/{id}/results-sent-to-prescriber',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
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

        handler: sessionController.flagResultsAsSentToPrescriber,
        tags: ['api', 'sessions'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de marquer le fait que les résultats de la session ont été envoyés au prescripteur,\n',
          '- par le biais de la sauvegarde de la date courante.',
        ],
      },
    },

    {
      method: 'PUT',
      path: '/api/admin/sessions/{id}/comment',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
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
        handler: sessionController.commentAsJury,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Ajoute/modifie un commentaire d'un membre du pôle certification (certification-officer)",
        ],
        tags: ['api', 'session', 'assignment'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/sessions/{id}/comment',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
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
        handler: sessionController.deleteJuryComment,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Supprime le commentaire d'un membre du pôle certification (certification-officer)",
        ],
        tags: ['api', 'session', 'assignment'],
      },
    },
    {
      method: 'PUT',
      path: '/api/sessions/{id}/enrol-students-to-session',
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
        handler: sessionController.enrolStudentsToSession,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Dans le cadre du SCO, inscrit un élève à une session de certification',
        ],
        tags: ['api', 'sessions', 'certification-candidates'],
      },
    },
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
        handler: sessionWithCleaCertifiedCandidateController.getCleaCertifiedCandidateDataCsv,
        tags: ['api', 'sessions', 'export-csv'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne toutes les infos des candidats d'une session ayant obtenu la certification Clea, sous format CSV",
        ],
      },
    },
  ]);
};

const name = 'sessions-api';
export { name, register };
