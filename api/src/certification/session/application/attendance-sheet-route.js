import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { attendanceSheetController } from './attendance-sheet-controller.js';
import { LOCALE } from '../../../shared/domain/constants.js';
const { FRENCH_SPOKEN, ENGLISH_SPOKEN } = LOCALE;

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/attendance-sheet',
      config: {
        auth: false,
        validate: {
          query: Joi.object({
            lang: Joi.string().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
            accessToken: Joi.string().required(),
          }),
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
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
export { register, name };
