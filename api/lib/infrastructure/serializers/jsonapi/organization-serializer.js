const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations, meta) {
    return new Serializer('organizations', {
      transform(record) {
        record.targetProfiles = [];
        return record;
      },
      attributes: ['name', 'type', 'logoUrl', 'externalId', 'provinceCode', 'isManagingStudents', 'credit', 'memberships', 'students', 'targetProfiles'],
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/organizations/${parent.id}/memberships`;
          }
        }
      },
      students: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/organizations/${parent.id}/students`;
          }
        }
      },
      targetProfiles: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/organizations/${parent.id}/target-profiles`;
          }
        }
      },
      meta
    }).serialize(organizations);
  },

};
