import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { learnerListController } from './learner-list-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'filter[fullName]': Joi.string().empty(''),
            'filter[certificability][]': [Joi.string(), Joi.array().items(Joi.string())],
            'sort[participationCount]': Joi.string().empty(''),
            'sort[lastnameSort]': Joi.string().empty(''),
            'sort[latestParticipationOrder]': Joi.string().empty(''),
          }),
        },
        handler: learnerListController.findPaginatedFilteredParticipants,
        tags: ['api', 'organization-participants'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des participants d'une organisation sans import\n",
        ],
      },
    },
  ]);
};

const name = 'learner-list-api';

export { name, register };
