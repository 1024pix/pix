const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'outdated', 'isPublic', 'createdAt', 'ownerOrganizationId', 'badges', 'skills', 'tubes', 'competences', 'areas', 'imageUrl'],
      skills: {
        ref: 'id',
        included: true,
        attributes: ['name', 'tubeId', 'difficulty'],
      },
      tubes: {
        ref: 'id',
        included: true,
        attributes: ['practicalTitle', 'competenceId'],
      },
      competences: {
        ref: 'id',
        included: true,
        attributes: ['name', 'areaId'],
      },
      areas: {
        ref: 'id',
        included: true,
        attributes: ['title', 'color'],
      },
      badges: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/admin/target-profiles/${parent.id}/badges`;
          },
        },
      },
      meta,
    }).serialize(targetProfiles);
  },
};
