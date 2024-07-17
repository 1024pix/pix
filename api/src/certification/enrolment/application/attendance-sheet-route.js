import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { attendanceSheetController } from './attendance-sheet-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/attendance-sheet',
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
        handler: attendanceSheetController.getAttendanceSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
            '- Cette route permet de télécharger le pv de session pré-rempli au format ods',
        ],
      },
    },
  ]);
};

const name = 'attendance-sheet-api';
export { name, register };
