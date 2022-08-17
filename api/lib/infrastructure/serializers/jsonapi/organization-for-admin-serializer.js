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
        'creatorFullName',
        'tags',
        'memberships',
        'students',
        'targetProfileSummaries',
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
      targetProfileSummaries: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/admin/organizations/${parent.id}/target-profile-summaries`;
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
