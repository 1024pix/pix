import { Serializer } from 'jsonapi-serializer';

const serialize = function (targetProfiles, meta) {
  return new Serializer('target-profile', {
    attributes: ['name', 'tubeCount', 'thematicResultCount', 'hasStage', 'description', 'category'],
    meta,
  }).serialize(targetProfiles);
};

export { serialize };
