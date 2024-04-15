import jsonapiSerializer from 'jsonapi-serializer';

import { tutorialAttributes } from '../../../../../devcomp/infrastructure/serializers/jsonapi/tutorial-attributes.js';

const { Serializer } = jsonapiSerializer;

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
