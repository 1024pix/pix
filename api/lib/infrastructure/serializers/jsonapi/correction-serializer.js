const { Serializer } = require('jsonapi-serializer');
const tutorialAttributes = require('./tutorial-attributes');

module.exports = {
  serialize(correction) {
    return new Serializer('corrections', {
      transform: (record) => ({
        ...correction,
        hint: record.hint?.value,
        tutorials: correction.tutorials.map((tutorial) => ({
          ...tutorial,
          userSavedTutorial: { ...tutorial.userSavedTutorial },
        })),
        learningMoreTutorials: correction.learningMoreTutorials.map((tutorial) => ({
          ...tutorial,
          userSavedTutorial: { ...tutorial.userSavedTutorial },
        })),
      }),
      attributes: ['solution', 'solutionToDisplay', 'hint', 'tutorials', 'learningMoreTutorials', 'userSavedTutorials'],
      tutorials: tutorialAttributes,
      learningMoreTutorials: tutorialAttributes,
      typeForAttribute(attribute) {
        switch (attribute) {
          case 'userSavedTutorial':
            return 'user-saved-tutorial';
          case 'learningMoreTutorials':
            return 'tutorials';
          default:
            return attribute;
        }
      },
    }).serialize(correction);
  },
};
