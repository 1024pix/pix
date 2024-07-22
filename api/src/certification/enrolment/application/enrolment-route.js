import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { enrolmentController } from './enrolment-controller.js';

const register = async function (server) {
  server.route([
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
        handler: enrolmentController.enrolStudentsToSession,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Dans le cadre du SCO, inscrit un élève à une session de certification',
        ],
        tags: ['api', 'sessions', 'students'],
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
        handler: enrolmentController.getCandidatesImportSheet,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification ayant créé la session**\n' +
            "- Cette route permet de télécharger le template d'import des candidats d'une certification au format ods",
        ],
      },
    },
  ]);
};

const name = 'enrolment-api';
export { name, register };
