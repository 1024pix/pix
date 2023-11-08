import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { scoLearnerListController } from './sco-learner-list-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

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
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[connectionTypes][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[search]': Joi.string().empty(''),
            'filter[certificability][]': [Joi.string(), Joi.array().items(Joi.string())],
            'sort[participationCount]': Joi.string().empty(''),
            'sort[lastnameSort]': Joi.string().empty(''),
            'sort[divisionSort]': Joi.string().empty(''),
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

export { register, name };
