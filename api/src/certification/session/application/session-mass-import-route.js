import { sessionMassImportController } from './session-mass-import-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

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
        handler: sessionMassImportController.validateSessionsForMassImport,
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
        handler: sessionMassImportController.createSessionsForMassImport,
        tags: ['api', 'certification-center', 'sessions', 'mass-import'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet de créer les sessions et candidats lors de l'import en masse",
        ],
      },
    },
  ]);
};

const name = 'session-mass-import-api';
export { register, name };
