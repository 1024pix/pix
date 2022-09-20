const { Serializer } = require('jsonapi-serializer');
const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes');
const userSavedTutorialAttributes = require('./user-saved-tutorial-attributes');

module.exports = {
  serialize(tutorial = {}, pagination) {
    return new Serializer('tutorials', {
      transform(tutorial) {
        return {
          ...tutorial,
          userTutorial: tutorial.userSavedTutorial,
        };
      },
      attributes: [
        'duration',
        'format',
        'link',
        'source',
        'title',
        'tubeName',
        'tubePracticalTitle',
        'tubePracticalDescription',
        'tutorialEvaluation',
        'userSavedTutorial',
        'userTutorial',
        'skillId',
      ],
      tutorialEvaluation: tutorialEvaluationAttributes,
      userSavedTutorial: userSavedTutorialAttributes,
      userTutorial: userSavedTutorialAttributes,
      typeForAttribute(attribute) {
        if (attribute === 'userSavedTutorial') return 'user-saved-tutorial';
        if (attribute === 'userTutorial') return 'user-tutorial';
        return attribute;
      },
      meta: pagination,
    }).serialize(tutorial);
  },
};
