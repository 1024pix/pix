import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { invigilatorKitController } from './invigilator-kit-controller.js';
import { authorization } from '../../../../lib/application/preHandlers/authorization.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/supervisor-kit',
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
        handler: invigilatorKitController.getInvigilatorKitPdf,
        tags: ['api', 'sessions', 'invigilator'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
            '- Cette route permet de télécharger le kit surveillant au format pdf',
        ],
      },
    },
  ]);
};

const name = 'invigilator-kit-api';
export { register, name };
