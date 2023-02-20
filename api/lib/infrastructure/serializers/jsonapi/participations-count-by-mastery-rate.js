import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(model) {
    return new Serializer('participations-count-by-mastery-rate', {
      id: 'campaignId',
      attributes: ['resultDistribution'],
    }).serialize(model);
  },
};
