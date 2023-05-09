import { Serializer } from 'jsonapi-serializer';

const serialize = function (model) {
  return new Serializer('participations-count-by-mastery-rate', {
    id: 'campaignId',
    attributes: ['resultDistribution'],
  }).serialize(model);
};

export { serialize };
