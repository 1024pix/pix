const { Serializer } = require('jsonapi-serializer');
const tutorial = require('./tutorial-attributes.js');

module.exports = {

  serialize(userTutorial) {
    return new Serializer('user-tutorial', {
      attributes: ['tutorial', 'userId', 'tutorialId', 'updatedAt'],
      tutorial,
    }).serialize(userTutorial);
  },
};
