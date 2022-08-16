const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles) {
    return new Serializer('target-profile', {
      transform(record) {
        record.oldAreas = record.areas;
        return record;
      },
      attributes: [
        'isNewFormat',
        'name',
        'outdated',
        'isPublic',
        'createdAt',
        'ownerOrganizationId',
        'description',
        'comment',
        'imageUrl',
        'category',
        'isSimplifiedAccess',
        'oldAreas',
        'badges',
        'stages',
      ],
      oldAreas: {
        ref: 'id',
        included: true,
        attributes: ['title', 'code', 'color', 'competences'],
        competences: {
          ref: 'id',
          included: true,
          attributes: ['name', 'index', 'tubes'],
          tubes: {
            ref: 'id',
            included: true,
            attributes: ['practicalTitle', 'skills'],
            skills: {
              ref: 'id',
              included: true,
              attributes: ['name', 'difficulty'],
            },
          },
        },
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
      typeForAttribute(attribute) {
        if (attribute === 'areas') return 'old-areas';
        if (attribute === 'competences') return 'old-competences';
        if (attribute === 'tubes') return 'old-tubes';
        if (attribute === 'skills') return 'old-skills';
        return undefined;
      },
    }).serialize(targetProfiles);
  },
};
