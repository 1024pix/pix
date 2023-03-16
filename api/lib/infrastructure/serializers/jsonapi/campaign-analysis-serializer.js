import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { tutorialAttributes } from './tutorial-attributes.js';

const serialize = function (results) {
  return new Serializer('campaign-analysis', {
    attributes: ['campaignTubeRecommendations'],
    campaignTubeRecommendations: {
      ref: 'id',
      includes: true,
      attributes: [
        'tubeId',
        'competenceId',
        'competenceName',
        'tubePracticalTitle',
        'areaColor',
        'averageScore',
        'tutorials',
        'tubeDescription',
      ],
      tutorials: tutorialAttributes,
    },
  }).serialize(results);
};

export { serialize };
