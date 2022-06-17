const { Serializer } = require('jsonapi-serializer');
const tutorial = require('./tutorial-attributes.js');

module.exports = {
  serialize(tutorialEvaluation) {
    return new Serializer('tutorial-evaluation', {
      attributes: ['tutorial', 'userId', 'tutorialId', 'status', 'updatedAt'],
      tutorial,
    }).serialize(tutorialEvaluation);
  },
};
