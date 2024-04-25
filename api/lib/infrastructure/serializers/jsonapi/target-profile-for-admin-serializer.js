import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ targetProfile, filter }) {
  if (filter?.badges === 'certifiable') {
    return new Serializer('target-profile', {
      transform(record) {
        record.badges = record.badges.filter((badge) => badge.isCertifiable);
        return record;
      },
      attributes: ['name', 'badges'],
      badges: {
        ref: 'id',
        included: true,
        attributes: ['title', 'isCertifiable'],
      },
    }).serialize(targetProfile);
  }

  return new Serializer('target-profile', {
    transform(record) {
      record.stageCollection = record.stageCollection.toDTO();
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
      'areKnowledgeElementsResettable',
      'hasLinkedCampaign',
      'hasLinkedAutonomousCourse',
      'badges',
      'stageCollection',
      'areas',
      'maxLevel',
    ],
    badges: {
      ref: 'id',
      included: true,
      attributes: ['altMessage', 'imageUrl', 'message', 'title', 'key', 'isCertifiable', 'isAlwaysVisible', 'criteria'],
      criteria: {
        ref: 'id',
        included: true,
        attributes: ['threshold', 'scope', 'cappedTubes', 'name'],
      },
    },
    stageCollection: {
      ref: 'id',
      included: true,
      attributes: ['targetProfileId', 'stages'],
      stages: {
        ref: 'id',
        included: true,
        attributes: [
          'threshold',
          'level',
          'isFirstSkill',
          'title',
          'message',
          'prescriberTitle',
          'prescriberDescription',
        ],
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
            attributes: ['name', 'practicalTitle', 'level', 'mobile', 'tablet', 'skills'],
            skills: {
              ref: 'id',
              included: true,
              attributes: ['difficulty'],
            },
          },
        },
      },
    },
    typeForAttribute(attribute) {
      if (attribute === 'criteria') return 'badge-criteria';
      return undefined;
    },
  }).serialize(targetProfile);
};

export { serialize };
