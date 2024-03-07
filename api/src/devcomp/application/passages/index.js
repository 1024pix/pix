import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { passageController } from './controller.js';
import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/passages',
      config: {
        auth: false,
        handler: handlerWithDependencies(passageController.create),
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'module-id': Joi.string().required(),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        notes: ['- Permet de créer un passage pour un module'],
        tags: ['api', 'passages', 'modules'],
      },
    },
    {
      method: 'POST',
      path: '/api/passages/{passageId}/answers',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            passageId: identifiersType.passageId.required(),
          }).required(),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'element-id': Joi.string().guid({ version: 'uuidv4' }).required(),
                'user-response': Joi.array().required(),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: handlerWithDependencies(passageController.verifyAndSaveAnswer),
        notes: ["- Permet de vérifier la réponse d'un élément et de la stocker"],
        tags: ['api', 'passages', 'element', 'réponse'],
      },
    },
    {
      method: 'POST',
      path: '/api/passages/{passageId}/terminate',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            passageId: identifiersType.passageId.required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: handlerWithDependencies(passageController.terminate),
        notes: ['- Permet de marquer un passage comme terminé'],
        tags: ['api', 'passages'],
      },
    },
  ]);
};

const name = 'passages-api';
export { register, name };
