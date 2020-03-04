const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(userTutorial) {
    return new Serializer('user-tutorial', {
      transform: (currentUserTutorial) => {
        return { id: `${currentUserTutorial.userId}_${currentUserTutorial.tutorialId}` };
      },
    }).serialize(userTutorial);
  },
};
