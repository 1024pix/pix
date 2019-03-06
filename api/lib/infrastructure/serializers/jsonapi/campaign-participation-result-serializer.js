const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-participation-result', {
      attributes: ['totalSkills', 'testedSkills', 'validatedSkills', 'isCompleted'],
    }).serialize(results);
  },
};
