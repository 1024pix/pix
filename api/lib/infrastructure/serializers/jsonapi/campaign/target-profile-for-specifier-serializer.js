import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'tubeCount', 'thematicResultCount', 'hasStage', 'description', 'category'],
      meta,
    }).serialize(targetProfiles);
  },
};
