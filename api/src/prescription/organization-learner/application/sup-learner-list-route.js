import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { supLearnerListController } from './sup-learner-list-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/sup-participants',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents,
            assign: 'belongsToSupOrganizationAndManagesStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[size]': Joi.number().integer().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'filter[certificability][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[groups][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[search]': Joi.string().empty(''),
            'filter[studentNumber]': Joi.string().empty(''),
            'sort[participationCount]': Joi.string().empty(''),
            'sort[lastnameSort]': Joi.string().empty(''),
          }),
        },
        handler: supLearnerListController.findPaginatedFilteredSupParticipants,
        tags: ['api', 'organization', 'sup-participants'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés membres d'un espace Orga**\n" +
            '- Récupération des étudiants liés à une organisation SUP\n',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/groups',
      config: {
        pre: [{ method: securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: supLearnerListController.getGroups,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les groupes rattachés à l’organisation.',
        ],
      },
    },
  ]);
};

const name = 'sup-learner-list-api';

export { name, register };
