const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: [
        'name',
        'outdated',
        'isPublic',
        'createdAt',
        'ownerOrganizationId',
        'description',
        'comment',
        'badges',
        'stages',
        'skills',
        'tubes',
        'competences',
        'areas',
        'imageUrl',
        'category',
        'isSimplifiedAccess',
        'template',
      ],
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
        attributes: ['name', 'areaId', 'index'],
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
      stages: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/admin/target-profiles/${parent.id}/stages`;
          },
        },
      },
      template: {
        ref: 'id',
      },
      typeForAttribute: function (type) {
        if (type === 'template') {
          return 'target-profile-templates';
        }
        return undefined; // fallback to default type name
      },
      meta,
    }).serialize(targetProfiles);
  },
};
