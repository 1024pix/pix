import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(trainingSummaries, meta) {
    return new Serializer('training-summaries', {
      attributes: ['title'],
      meta,
    }).serialize(trainingSummaries);
  },
};
