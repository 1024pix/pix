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
        'campaignParticipationBadges',
        'competenceResults',
        'reachedStage',
        'stageCount',
        'canRetry',
        'canImprove',
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
          'partnerCompetenceResults',
          'isAlwaysVisible',
        ],
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
        ],
      },
      reachedStage: {
        ref: 'id',
        attributes: [
          'title',
          'message',
          'threshold',
          'starCount',
        ],
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
  return {
    ...badgeResult,
    partnerCompetenceResults: badgeResult.partnerCompetenceResults.map((partnerCompetenceResult) => { return { ...partnerCompetenceResult, areaColor: partnerCompetenceResult.color }; }),
  };
}
