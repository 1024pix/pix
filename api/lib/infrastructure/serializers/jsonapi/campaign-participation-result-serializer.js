const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-participation-result', {
      attributes: [
        'masteryPercentage',
        'totalSkillsCount',
        'testedSkillsCount',
        'validatedSkillsCount',
        'isCompleted',
        'areBadgeCriteriaFulfilled',
        'badges',
        'partnerCompetenceResults',
        'competenceResults',
        'progress'
      ],
      badges: {
        ref: 'id',
        attributes: [
          'altMessage',
          'message',
          'imageUrl',
          'key'
        ],
      },
      partnerCompetenceResults: {
        ref: 'id',
        attributes: [
          'name',
          'areaColor',
          'masteryPercentage',
          'totalSkillsCount',
          'testedSkillsCount',
          'validatedSkillsCount'
        ],
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
          'validatedSkillsCount'
        ],
      },
    }).serialize(results);
  },
};
