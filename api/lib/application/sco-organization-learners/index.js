import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, UnprocessableEntityError } from '../../../src/shared/application/http-errors.js';
import { libScoOrganizationLearnerController } from './sco-organization-learner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/sco-organization-learners/possibilities',
      config: {
        auth: false,
        handler: libScoOrganizationLearnerController.generateUsername,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().trim().empty(null).required(),
                'last-name': Joi.string().trim().empty(null).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'organization-id': Joi.number().empty(null).required(),
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est inscrit à ' +
            "l'organisation détenant la campagne. Cet élève n'est, de plus, pas encore associé à l'organisation.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
  ]);
};

const name = 'sco-organization-learners-api';
export { name, register };
