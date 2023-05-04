import { Serializer } from 'jsonapi-serializer';

const serialize = function (targetProfileSummaries, meta) {
  return new Serializer('target-profile-summary', {
    attributes: ['name', 'outdated'],
    meta,
  }).serialize(targetProfileSummaries);
};

export { serialize };
