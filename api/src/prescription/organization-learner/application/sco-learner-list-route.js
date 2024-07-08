import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { scoLearnerListController } from './sco-learner-list-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/sco-participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
            assign: 'belongsToScoOrganizationAndManagesStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            page: {
              size: Joi.number().integer().empty(''),
              number: Joi.number().integer().empty(''),
            },
            filter: Joi.object({
              divisions: [Joi.string(), Joi.array().items(Joi.string())],
              connectionTypes: [Joi.string(), Joi.array().items(Joi.string())],
              search: Joi.string().empty(''),
              certificability: [Joi.string(), Joi.array().items(Joi.string())],
            }).default({}),
            sort: {
              participationCount: Joi.string().empty(''),
              lastnameSort: Joi.string().empty(''),
              divisionSort: Joi.string().empty(''),
            },
          }),
        },
        handler: scoLearnerListController.findPaginatedFilteredScoParticipants,
        tags: ['api', 'organization', 'sco-participants'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés membres d'un espace Orga**\n" +
            '- Récupération des élèves liés à une organisation SCO\n',
        ],
      },
    },
  ]);
};

const name = 'sco-learner-list-api';

export { name, register };
