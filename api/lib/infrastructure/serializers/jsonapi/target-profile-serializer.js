const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profiles', {
      attributes: ['name'],
      meta,
    }).serialize(targetProfiles);
  },
};
