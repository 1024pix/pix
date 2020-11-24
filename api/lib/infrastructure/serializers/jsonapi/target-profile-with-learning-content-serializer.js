const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'outdated', 'isPublic', 'organizationId', 'skills', 'organizations'],
      skills: {
        ref: 'id',
        included: true,
        attributes: ['name'],
      },
      organizations: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/target-profiles/${parent.id}/organizations`;
          },
        },
      },
      meta,
    }).serialize(targetProfiles);
  },
};
