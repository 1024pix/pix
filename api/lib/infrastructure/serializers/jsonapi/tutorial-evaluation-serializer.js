const { Serializer } = require('jsonapi-serializer');
const tutorial = require('./tutorial-attributes.js');
const TutorialEvaluation = require('../../../domain/models/TutorialEvaluation.js');

module.exports = {
  serialize(tutorialEvaluation) {
    return new Serializer('tutorial-evaluation', {
      attributes: ['tutorial', 'userId', 'tutorialId', 'status', 'updatedAt'],
      tutorial,
    }).serialize(tutorialEvaluation);
  },

  deserialize(json) {
    return new TutorialEvaluation({
      id: json?.data.id,
      userId: json?.data.attributes['user-id'],
      tutorialId: json?.data.attributes['tutorial-id'],
      status: json?.data.attributes.status,
    });
  },
};
