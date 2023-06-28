import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('participations-count-by-mastery-rate', {
    id: 'campaignId',
    attributes: ['resultDistribution'],
  }).serialize(model);
};

export { serialize };
