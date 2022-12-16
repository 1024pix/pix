const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'tubeCount', 'thematicResultCount', 'hasStage', 'description', 'category'],
      meta,
    }).serialize(targetProfiles);
  },
};
