import { Serializer } from 'jsonapi-serializer';

const serialize = function (model) {
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
};

export { serialize };
