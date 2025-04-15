import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { scoOrganizationLearnerController } from './sco-organization-learner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/sco-organization-learners/external',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.createUserAndReconcileToOrganizationLearnerFromExternalUser,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'external-user-token': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'access-token': Joi.string().allow(null).optional(),
              },
              type: 'external-users',
            },
          }),
        },
        notes: [
          "Cette route crée un compte utilisateur suite à une connexion provenant d'un IDP externe (GAR). " +
            "Les informations sont fournies dans un token. Elle réconcilie également cet utilisateur avec l'inscription " +
            "de l'élève au sein de l'organisation qui a créé la campagne.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
  ]);
};

const name = 'sco-organization-learner-route';
export { name, register };
