import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { sessionMassImportController } from './session-mass-import-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/sessions/validate-for-mass-import',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
          {
            method: securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents,
            assign: 'isCertificationCenterNotScoManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({ certificationCenterId: identifiersType.certificationCenterId }),
        },
        handler: sessionMassImportController.validateSessions,
        payload: {
          maxBytes: 20715200,
          output: 'file',
          parse: 'gunzip',
        },
        tags: ['api', 'certification-center', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet de valider avant sauvegarde les données d'un fichier contenant une liste de sessions à importer",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/sessions/confirm-for-mass-import',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
          {
            method: securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents,
            assign: 'isCertificationCenterNotScoManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({ certificationCenterId: identifiersType.certificationCenterId }),
          payload: Joi.object({
            data: {
              attributes: {
                cachedValidatedSessionsKey: Joi.string().required(),
              },
            },
          }),
        },
        handler: sessionMassImportController.createSessions,
        tags: ['api', 'certification-center', 'sessions', 'mass-import'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet de créer les sessions et candidats lors de l'import en masse",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{certificationCenterId}/import',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
          {
            method: securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents,
            assign: 'isCertificationCenterNotScoManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({ certificationCenterId: identifiersType.certificationCenterId }),
        },
        handler: sessionMassImportController.getTemplate,
        tags: ['api', 'sessions'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés membres d'un espace Pix Certif  hors SCO et ne gérant pas d'élèves**\n" +
            '- Elle permet de récupérer le fichier de création de sessions de certification',
        ],
      },
    },
  ]);
};

const name = 'session-mass-import-api';
export { name, register };
