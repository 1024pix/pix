const { Serializer } = require('jsonapi-serializer');
const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes.js');
const userSavedTutorialAttributes = require('./user-saved-tutorial-attributes.js');

module.exports = {
  serialize(tutorial = {}, pagination) {
    return new Serializer('tutorials', {
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
        'skillId',
      ],
      tutorialEvaluation: tutorialEvaluationAttributes,
      userSavedTutorial: userSavedTutorialAttributes,
      typeForAttribute(attribute) {
        if (attribute === 'userSavedTutorial') return 'user-saved-tutorial';
        return attribute;
      },
      meta: pagination,
    }).serialize(tutorial);
  },
};
