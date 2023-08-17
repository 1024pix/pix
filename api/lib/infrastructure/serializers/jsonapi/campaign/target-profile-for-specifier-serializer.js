import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfiles, meta) {
  return new Serializer('target-profile', {
    attributes: [
      'name',
      'tubeCount',
      'thematicResultCount',
      'hasStage',
      'description',
      'category',
      'areKnowledgeElementsResettable',
    ],
    meta,
  }).serialize(targetProfiles);
};

export { serialize };
