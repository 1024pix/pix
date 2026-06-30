import Joi from 'joi';

import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { assessmentController } from './assessment-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/assessments/{id}/next',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getNextChallengeForPix1d,
        notes: ["- Récupération de la question suivante pour l'évaluation de mission donnée"],
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/pix1d/assessments',
      config: {
        auth: false,
        handler: assessmentController.create,
        validate: {
          payload: Joi.object({
            missionId: identifiersType.missionId,
            learnerId: identifiersType.organizationLearnerId,
          }),
        },
        tags: ['api', 'pix1d', 'assessment'],
      },
    },
    {
      method: 'GET',
      path: '/api/pix1d/assessments/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getById,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/pix1d/assessments/{id}/current-activity',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getCurrentActivity,
        notes: ["- Récupération de l'activité courante"],
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/pix1d/assessments/preview',
      config: {
        auth: false,
        handler: assessmentController.createAssessmentPreviewForPix1d,
        tags: ['api', 'pix1d', 'assessment'],
      },
    },
  ]);
};
export const assessmentRoute = { name: 'school/assessment-pix1d-api', register };
