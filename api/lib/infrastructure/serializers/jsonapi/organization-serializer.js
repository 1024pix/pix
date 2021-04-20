const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations, meta) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'logoUrl', 'externalId', 'provinceCode', 'isManagingStudents', 'credit', 'canCollectProfiles', 'email', 'memberships', 'students', 'targetProfiles', 'tags'],
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/organizations/${parent.id}/memberships`;
          },
        },
      },
      students: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/organizations/${parent.id}/students`;
          },
        },
      },
      targetProfiles: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/organizations/${parent.id}/target-profiles`;
          },
        },
      },
      tags: {
        ref: 'id',
        included: true,
        attributes: ['id', 'name'],
      },
      meta,
    }).serialize(organizations);
  },

};
