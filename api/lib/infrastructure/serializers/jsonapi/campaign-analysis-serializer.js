import { Serializer } from 'jsonapi-serializer';
import tutorialAttributes from './tutorial-attributes';

export default {
  serialize(results) {
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
  },
};
