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
        'badge',
        'competenceResults'
      ],
      badge: {
        ref: 'id',
        attributes: ['altMessage', 'message', 'imageUrl'],
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
