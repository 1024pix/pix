import Joi from 'joi';

import { getCalibration } from './complementary-certification-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/complementary-certification/{scope}',
      config: {
        validate: {
          params: {
            scope: Joi.string().required(),
          },
        },
        auth: { access: { scope: 'meta' } },
        handler: getCalibration,
        description: "récupère la calibration d'une certification complémentaire",
        notes: [
          'Retourne la liste des challenges de la complémentaire avec les difficultés et discriminant qui ont été calculés',
          '**Cette route nécessite le scope de complémentaire.**',
        ],
        tags: ['api', 'calibration', 'certificaiton', 'complementary'],
      },
    },
  ]);
};

const name = 'maddo-certification-complementary-api';
export { name, register };
