import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

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
