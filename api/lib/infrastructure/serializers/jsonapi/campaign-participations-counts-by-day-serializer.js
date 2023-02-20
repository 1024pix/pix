import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(model) {
    return new Serializer('campaign-participations-counts-by-day', {
      id: 'campaignId',
      attributes: ['startedParticipations', 'sharedParticipations'],
      startedParticipations: {
        attributes: ['day', 'count'],
      },
      sharedParticipations: {
        attributes: ['day', 'count'],
      },
    }).serialize(model);
  },
};
