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
      'campaignParticipationBadges',
      'competenceResults',
      'reachedStage',
      'canRetry',
      'canReset',
      'isDisabled',
      'sharedAt',
      'remainingSecondsBeforeRetrying',
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
        'description',
        'masteryPercentage',
        'totalSkillsCount',
        'testedSkillsCount',
        'validatedSkillsCount',
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

function transform(record) {
  return {
    ...record,
    campaignParticipationBadges: record.badgeResults,
  };
}

export const participantResultSerializer = { serialize };
