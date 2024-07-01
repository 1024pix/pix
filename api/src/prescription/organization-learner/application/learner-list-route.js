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
      path: '/api/organizations/{organizationId}/participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          query: Joi.object({
            page: Joi.object({
              size: Joi.number().integer().empty(''),
              number: Joi.number().integer().empty(''),
            }).default({}),
            filter: Joi.object({
              fullName: Joi.string().empty(''),
              certificability: [Joi.string(), Joi.array().items(Joi.string())],
            }).default({}),
            sort: Joi.object({
              participationCount: Joi.string().empty(''),
              lastnameSort: Joi.string().empty(''),
              latestParticipationOrder: Joi.string().empty(''),
            }).default({}),
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
