const { Serializer } = require('jsonapi-serializer');
module.exports = {
  serialize(results) {
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
          'skillSetResults',
          'partnerCompetenceResults',
          'isAlwaysVisible',
          'isCertifiable',
          'isValid',
        ],
        skillSetResults: {
          ref: 'id',
          included: true,
          attributes: [
            'name',
            'index',
            'areaColor',
            'masteryPercentage',
            'totalSkillsCount',
            'testedSkillsCount',
            'validatedSkillsCount',
          ],
        },
        partnerCompetenceResults: {
          ref: 'id',
          included: true,
          attributes: [
            'name',
            'index',
            'areaColor',
            'masteryPercentage',
            'totalSkillsCount',
            'testedSkillsCount',
            'validatedSkillsCount',
          ],
        },
      },
      competenceResults: {
        ref: 'id',
        attributes: [
          'name',
          'index',
          'areaColor',
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
        attributes: ['title', 'message', 'totalStage', 'reachedStage'],
      },
      typeForAttribute(attribute) {
        return attribute === 'reachedStage' ? 'reached-stages' : attribute;
      },
    }).serialize(results);
  },
};

function transform(record) {
  return {
    ...record,
    campaignParticipationBadges: record.badgeResults.map(mapBadgeResult),
  };
}

function mapBadgeResult(badgeResult) {
  const skillSetResults = badgeResult.skillSetResults.map((skillSetResult) => {
    return { ...skillSetResult, areaColor: skillSetResult.color };
  });
  return {
    ...badgeResult,
    skillSetResults,
    partnerCompetenceResults: skillSetResults,
  };
}
