const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-participation-result', {
      attributes: ['totalSkillsCount', 'testedSkillsCount', 'validatedSkillsCount', 'isCompleted'],
    }).serialize(results);
  },
};
