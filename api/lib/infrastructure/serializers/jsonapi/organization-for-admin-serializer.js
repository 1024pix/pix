const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizations, meta) {
    return new Serializer('organizations', {
      attributes: [
        'name',
        'type',
        'logoUrl',
        'externalId',
        'provinceCode',
        'isManagingStudents',
        'credit',
        'email',
        'documentationUrl',
        'createdBy',
        'showNPS',
        'formNPSUrl',
        'showSkills',
        'archivedAt',
        'archivistFullName',
        'tags',
        'memberships',
        'students',
        'targetProfiles',
      ],
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
        nullIfMissing: true,
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
          related(record, current, parent) {
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
