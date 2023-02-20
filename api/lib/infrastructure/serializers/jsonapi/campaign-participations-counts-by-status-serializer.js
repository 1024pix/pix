import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(model) {
    return new Serializer('campaign-participations-counts-by-status', {
      id: 'campaignId',
      attributes: ['started', 'completed', 'shared'],
    }).serialize(model);
  },
};
