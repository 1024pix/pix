import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(model) {
    return new Serializer('campaign-participations-count-by-stage', {
      id: 'campaignId',
      attributes: ['data'],
      data: {
        attributes: ['id', 'value', 'title', 'description'],
      },
    }).serialize(model);
  },
};
