const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-participation-result', {
      attributes: ['totalSkillsCount', 'testedSkillsCount', 'validatedSkillsCount', 'isCompleted', 'competenceResults'],
      competenceResults: {
        ref: 'id',
        attributes: ['name', 'index', 'totalSkillsCount', 'testedSkillsCount', 'validatedSkillsCount'],
      },
    }).serialize(results);
  },
};
