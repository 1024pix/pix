import Joi from 'joi';
import userTutorialsController from './user-tutorials-controller';
import identifiersType from '../../domain/types/identifiers-type';
import securityPreHandlers from '../security-pre-handlers';

export const register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/tutorials/{tutorialId}',
      config: {
        handler: userTutorialsController.add,
        validate: {
          params: Joi.object({
            tutorialId: identifiersType.tutorialId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'skill-id': Joi.string().allow(null),
              }),
            }),
          }).allow(null),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Enregistrement d‘un tutoriel par l‘utilisateur courant\n' +
            '- L’id du tutoriel doit faire référence à un tutoriel existant',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{userId}/tutorials',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
          }),
          query: Joi.object({
            'filter[type]': Joi.string().valid('recommended', 'saved').allow(null).empty(''),
            'filter[competences]': Joi.string().allow(null).empty(''),
          }),
          options: {
            allowUnknown: true,
          },
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userTutorialsController.find,
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des tutoriels pour l‘utilisateur courant\n',
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/users/tutorials/{tutorialId}',
      config: {
        validate: {
          params: Joi.object({
            tutorialId: identifiersType.tutorialId,
          }),
        },
        handler: userTutorialsController.removeFromUser,
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Suppression d‘un tutoriel de la liste des tutoriels enregistrés par l‘utilisateur courant\n' +
            ' - L‘id du tutoriel doit faire référence à un tutoriel existant',
        ],
      },
    },
  ]);
};

export const name = 'tutorials-api';
