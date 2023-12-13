import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (results) {
  return new Serializer('campaign-participation-results', {
    transform,
    attributes: [
      'masteryRate',
      'totalSkillsCount',
      'testedSkillsCount',
      'validatedSkillsCount',
      'isCompleted',
      'isShared',
      'participantExternalId',
      'estimatedFlashLevel',
      'flashPixScore',
      'campaignParticipationBadges',
      'competenceResults',
      'reachedStage',
      'canRetry',
      'canReset',
      'canImprove',
      'isDisabled',
    ],
    campaignParticipationBadges: {
      ref: 'id',
      included: true,
      attributes: [
        'altMessage',
        'message',
        'title',
        'imageUrl',
        'key',
        'isAcquired',
        'isAlwaysVisible',
        'isCertifiable',
        'isValid',
        'acquisitionPercentage',
      ],
    },
    competenceResults: {
      ref: 'id',
      attributes: [
        'name',
        'index',
        'areaColor',
        'areaTitle',
        'masteryPercentage',
        'totalSkillsCount',
        'testedSkillsCount',
        'validatedSkillsCount',
        'flashPixScore',
        'reachedStage',
      ],
    },
    reachedStage: {
      ref: 'id',
      attributes: ['title', 'message', 'totalStage', 'reachedStage', 'threshold'],
    },
    typeForAttribute(attribute) {
      return attribute === 'reachedStage' ? 'reached-stages' : attribute;
    },
  }).serialize(results);
};

export { serialize };

function transform(record) {
  return {
    ...record,
    campaignParticipationBadges: record.badgeResults,
  };
}
