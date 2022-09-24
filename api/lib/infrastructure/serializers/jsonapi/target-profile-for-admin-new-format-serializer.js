const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles) {
    return new Serializer('target-profile', {
      transform(record) {
        record.newAreas = record.areas;
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
        'newAreas',
        'badges',
        'stages',
      ],
      newAreas: {
        ref: 'id',
        included: true,
        attributes: ['title', 'code', 'color', 'frameworkId', 'competences'],
        competences: {
          ref: 'id',
          included: true,
          attributes: ['name', 'index', 'thematics'],
          thematics: {
            ref: 'id',
            included: true,
            attributes: ['name', 'index', 'tubes'],
            tubes: {
              ref: 'id',
              included: true,
              attributes: ['name', 'practicalTitle', 'level', 'mobile', 'tablet'],
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
        if (attribute === 'areas') return 'new-areas';
        if (attribute === 'competences') return 'new-competences';
        if (attribute === 'thematics') return 'new-thematics';
        if (attribute === 'tubes') return 'new-tubes';
        return undefined;
      },
    }).serialize(targetProfiles);
  },
};
