import Joi from 'joi';

import { userController } from './user.controller.js';

export const userRoutes = [
  {
    method: 'POST',
    path: '/api/users',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            type: Joi.string(),
            attributes: Joi.object().required(),
            relationships: Joi.object(),
          }).required(),
          meta: Joi.object(),
        }).required(),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userController.save(request, h),
      tags: ['api', 'user-account'],
    },
  },
];
