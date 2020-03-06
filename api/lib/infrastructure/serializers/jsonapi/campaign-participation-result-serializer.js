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
        'areBadgeCriteriaValidated',
        'badge',
        'competenceResults'
      ],
      badge: {
        ref: 'id',
        attributes: ['altMessage', 'message', 'imageUrl'],
      },
      competenceResults: {
        ref: 'id',
        attributes: ['name', 'index', 'areaColor', 'totalSkillsCount', 'testedSkillsCount', 'validatedSkillsCount'],
      },
    }).serialize(results);
  },
};
