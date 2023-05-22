import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('campaign-participations-counts-by-status', {
    id: 'campaignId',
    attributes: ['started', 'completed', 'shared'],
  }).serialize(model);
};

export { serialize };
