import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfileSummaries, meta) {
  return new Serializer('target-profile-summary', {
    attributes: ['internalName', 'outdated', 'createdAt', 'category', 'isPartOfCombinedCourse'],
    meta,
  }).serialize(targetProfileSummaries);
};

export { serialize };
