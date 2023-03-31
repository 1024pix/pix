const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles) {
    return new Serializer('target-profile', {
      transform(record) {
        record.badges = record.badges.map((badge) => {
          badge.criteria = badge.criteria.map((criteria) => criteria.toDTO());
          return badge;
        });
        return record;
      },
      attributes: [
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
        'badges',
        'stages',
        'areas',
        'maxLevel',
      ],
      badges: {
        ref: 'id',
        included: true,
        attributes: [
          'altMessage',
          'imageUrl',
          'message',
          'title',
          'key',
          'isCertifiable',
          'isAlwaysVisible',
          'criteria',
        ],
        criteria: {
          ref: 'id',
          included: true,
          attributes: ['threshold', 'scope', 'cappedTubes', 'name'],
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
      areas: {
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
      typeForAttribute(attribute) {
        if (attribute === 'criteria') return 'badge-criteria';
        return undefined;
      },
    }).serialize(targetProfiles);
  },
};
