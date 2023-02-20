import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(targetProfileSummaries, meta) {
    return new Serializer('target-profile-summary', {
      attributes: ['name', 'outdated'],
      meta,
    }).serialize(targetProfileSummaries);
  },
};
