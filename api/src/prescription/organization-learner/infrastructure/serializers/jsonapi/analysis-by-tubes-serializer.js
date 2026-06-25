import { randomUUID } from 'node:crypto';

import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (analysisByTubes) {
  return new Serializer('analysis-by-tubes', {
    transform(analysisByTubes) {
      return {
        id: randomUUID(),
        data: analysisByTubes.data.map((item) => ({
          ...item,
          niveau_par_sujet: Number(item.niveau_par_sujet).toFixed(1),
          niveau_par_user: Number(item.niveau_par_user).toFixed(1),
        })),
      };
    },
    attributes: ['data'],
  }).serialize(analysisByTubes);
};

export const analysisByTubesSerializer = { serialize };
