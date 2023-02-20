import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(sharedProfileForCampaign = {}) {
    return new Serializer('SharedProfileForCampaign', {
      // Transform is necessary due to a bug with 'jsonapi-serializer'
      // When a nested object (here: Area) is built with a class constructor
      // in a nested object, it will skip the serialization of the area
      // But when we use plain object instead of a class then serialization works.
      transform: (profile) => ({
        ...profile,
        scorecards: profile.scorecards.map((scorecard) => ({ ...scorecard, area: { ...scorecard.area } })),
      }),
      attributes: ['pixScore', 'sharedAt', 'scorecards', 'canRetry', 'maxReachableLevel', 'maxReachablePixScore'],
      scorecards: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'index',
          'competenceId',
          'earnedPix',
          'level',
          'pixScoreAheadOfNextLevel',
          'status',
          'area',
        ],
        area: {
          ref: 'id',
          attributes: ['code', 'title', 'color'],
        },
      },
    }).serialize(sharedProfileForCampaign);
  },
};
