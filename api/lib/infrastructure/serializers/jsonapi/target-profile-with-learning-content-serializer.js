const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'outdated', 'isPublic', 'organizationId', 'skills'],
      skills: {
        ref: 'id',
        included: true,
        attributes: ['name'],
      },
      meta,
    }).serialize(targetProfiles);
  },
};
