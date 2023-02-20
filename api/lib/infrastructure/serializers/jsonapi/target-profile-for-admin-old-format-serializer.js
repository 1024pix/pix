import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(targetProfiles) {
    return new Serializer('target-profile', {
      transform(record) {
        record.oldAreas = record.areas;
        record.badges = record.badges.map((badge) => {
          badge.criteria = badge.criteria.map((criteria) => criteria.toDTO());
          return badge;
        });
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
        'badges',
        'stages',
        'oldAreas',
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
          attributes: ['threshold', 'scope', 'skillSets', 'cappedTubes'],
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
      typeForAttribute(attribute) {
        if (attribute === 'areas') return 'old-areas';
        if (attribute === 'competences') return 'old-competences';
        if (attribute === 'tubes') return 'old-tubes';
        if (attribute === 'skills') return 'old-skills';
        if (attribute === 'criteria') return 'badge-criteria';
        return undefined;
      },
    }).serialize(targetProfiles);
  },
};
