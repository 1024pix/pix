import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (trainingSummaries, meta) {
  return new Serializer('training-summaries', {
    attributes: ['title'],
    meta,
  }).serialize(trainingSummaries);
};

export { serialize };
