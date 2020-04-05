const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(userTutorial) {
    return new Serializer('user-tutorial', {
      attributes: ['tutorial'],
      transform: (currentUserTutorial) => {
        const tutorial = { ...currentUserTutorial.tutorial, isSaved: true };
        const tutorialId = tutorial.id || currentUserTutorial.tutorialId;
        return { tutorial, id: `${currentUserTutorial.userId}_${tutorialId}` };
      },
      tutorial: {
        ref: 'id',
        includes: true,
        attributes: [
          'id',
          'duration',
          'format',
          'link',
          'source',
          'title',
        ]
      },
    }).serialize(userTutorial);
  },
};
